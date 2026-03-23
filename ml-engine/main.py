import time
from datetime import datetime, timedelta

import joblib
import numpy as np
import requests
from fastapi import FastAPI, HTTPException
from tensorflow.keras.models import load_model
from xgboost import XGBRegressor

app = FastAPI()

# --- LOAD ALL MODELS AT STARTUP ---
print("Waking up the ML Engine...")

scaler = joblib.load("bitcoin_scaler.pkl")
lstm_model = load_model("bitcoin_lstm.keras")
rf_model = joblib.load("bitcoin_rf.pkl")

# XGBoost requires initializing the class before loading the JSON
xgb_model = XGBRegressor()
xgb_model.load_model("bitcoin_xgb.json")

print("All 3 models loaded into memory. Server is ready!")


@app.get("/")
def read_root():
    return {"status": "Multi-Model ML Engine is online."}


# --- THE CACHE SYSTEM ---
CACHE_TIMEOUT = 300  # 5 minutes in seconds
last_fetch_time = 0
cached_live_prices = []


@app.get("/predict/{model_type}")
def predict_realtime(model_type: str):
    global last_fetch_time, cached_live_prices

    try:
        current_time = time.time()

        # 1. Check the Cache
        if current_time - last_fetch_time > CACHE_TIMEOUT or not cached_live_prices:
            print("Cache empty or expired. Fetching fresh data from CoinGecko...")
            url = "https://api.coingecko.com/api/v3/coins/bitcoin/market_chart?vs_currency=usd&days=100&interval=daily"
            response = requests.get(url)
            data = response.json()

            if "prices" not in data:
                raise ValueError(
                    f"CoinGecko API Error (Rate limited?). Response: {data}"
                )

            cached_live_prices = [item[1] for item in data["prices"]]
            last_fetch_time = current_time
        else:
            print("Using cached data (Super fast!)...")

        # 2. Extract Data
        current_live_price = cached_live_prices[-1]
        latest_data = np.array(cached_live_prices).reshape(-1, 1)
        model_req = model_type.lower()

        # 3. Model Inference (Exactly as you wrote it)
        if model_req == "lstm":
            last_60_days = latest_data[-60:]
            scaled_data = scaler.transform(last_60_days)
            X_input = np.reshape(scaled_data, (1, 60, 1))
            scaled_prediction = lstm_model.predict(X_input, verbose=0)
            final_price = scaler.inverse_transform(scaled_prediction)[0][0]

        elif model_req == "rf":
            last_7_days = latest_data[-7:].reshape(1, -1)
            final_price = rf_model.predict(last_7_days)[0]

        elif model_req == "xgboost":
            last_7_days = latest_data[-7:].reshape(1, -1)
            final_price = xgb_model.predict(last_7_days)[0]

        else:
            raise HTTPException(status_code=400, detail="Invalid model.")

        # ---------------------------------------------------------
        # 4. BUILD THE ARRAYS FOR THE FRONTEND CHART
        # ---------------------------------------------------------
        # ---------------------------------------------------------
        # 4. BUILD THE ARRAYS FOR THE FRONTEND CHART (HISTORICAL COMPARISON)
        # ---------------------------------------------------------
        graph_history_days = 7
        now = datetime.now()

        # A. Timestamps
        timestamps = []
        for i in range(graph_history_days - 1, -1, -1):
            day = now - timedelta(days=i)
            timestamps.append(day.strftime("%b %d"))

        tomorrow = now + timedelta(days=1)
        timestamps.append(tomorrow.strftime("%b %d") + " (Target)")

        # B. Actual Prices
        recent_actuals = cached_live_prices[-graph_history_days:]
        actual_prices_list = [float(p) for p in recent_actuals]
        actual_prices_list.append(None)  # Future actual is unknown

        # C. Predicted Prices (Calculating historical "guesses")
        # C. Predicted Prices (Calculating historical "guesses")
        predicted_prices_list = []

        for i in range(graph_history_days, 0, -1):
            # The 'target' for this specific historical prediction
            hist_end_idx = len(cached_live_prices) - i

            p_val = None  # Default to None if we don't have enough history

            try:
                if model_req == "lstm":
                    # LSTM needs EXACTLY 60 days.
                    # We take data ending AT the historical point.
                    if hist_end_idx >= 60:
                        hist_slice = np.array(
                            cached_live_prices[hist_end_idx - 60 : hist_end_idx]
                        ).reshape(-1, 1)
                        x_input = scaler.transform(hist_slice)
                        x_input = np.reshape(x_input, (1, 60, 1))
                        pred = lstm_model.predict(x_input, verbose=0)
                        p_val = float(scaler.inverse_transform(pred)[0][0])

                elif model_req in ["rf", "xgboost"]:
                    # RF/XGB only need 7 days.
                    if hist_end_idx >= 7:
                        hist_slice = np.array(
                            cached_live_prices[hist_end_idx - 7 : hist_end_idx]
                        ).reshape(1, -1)
                        m = rf_model if model_req == "rf" else xgb_model
                        p_val = float(m.predict(hist_slice)[0])
            except Exception as slice_err:
                print(f"Skipping hist point {i}: {slice_err}")
                p_val = None

            predicted_prices_list.append(p_val)

        # Append the final future prediction from Section 3
        predicted_prices_list.append(float(final_price))

        return {
            "requested_model": model_req.upper(),
            "timestamps": timestamps,
            "actual_prices": actual_prices_list,
            "predicted_prices": predicted_prices_list,
        }

    except Exception as e:
        print(f"!!! API Crash: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))
