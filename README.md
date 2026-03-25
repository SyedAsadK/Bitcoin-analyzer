# Bitcoin Analyzer 📈

Bitcoin Analyzer is a full-stack data analytics and machine learning application designed to analyze Bitcoin market trends, serving primarily as an experimental sandbox. Rather than claiming to definitively predict price movements, this project explores the limitations of forecasting cryptocurrency markets. Due to extreme volatility, sudden macroeconomic shifts, regulatory news, and whale movements, crypto assets often behave unpredictably, demonstrating why past performance and historical data are inherently unreliable indicators of future results.

![Screenshot of the Application](ss.png)
![models](ss2.png)
![workflow](ss3.png)

## 🏗️ Project Structure

This repository is split into three main components to ensure a clean separation of concerns:

- **`/ml-engine`** (FastAPI,Jupyter Notebook) 🧠
  Contains the core machine learning models, data exploration, and feature engineering scripts used to analyze Bitcoin historical data and predict trends.
- **`/backend-engine`** (Springboot(Java)) ⚙️
  The backend API layer responsible for serving data, interacting with databases, handling business logic, and exposing the machine learning model results to the web client.
- **`/frontend`** (Nextjs) 💻
  The user-facing web application that visualizes the Bitcoin data, charts, and predictive analysis through an interactive dashboard.

## 🚀 Features

- **Real-time Data Integration**: Fetches Bitcoin OHLCV data from public APIs
- **Advanced Feature Engineering**: 15+ technical indicators derived from price/volume
- **Deep Learning Models**: LSTM (GRU variants) and Transformer-based architectures
- **Ensemble Predictions**: Combines multiple models for robust forecasting
- **Low-Latency API**: Sub-100ms inference via Spring Boot REST endpoints
- **Model Versioning**: Automatic tracking of model performance and weights
- **Interactive Dashboard**: Real-time predictions and backtesting visualization

## 🛠️ Tech Stack

### ML Engine

- **Python 3.10+**
- **TensorFlow/Keras** - Deep learning models
- **Pandas/NumPy** - Data processing
- **Scikit-learn** - Feature scaling, evaluation metrics
- **Jupyter Notebook** - Experimentation & analysis

### Backend

- **Spring Boot** - REST API framework
- **Maven** - Dependency management

### Frontend

- **NextJS** - UI framework
- **Tailwind** - CSS
