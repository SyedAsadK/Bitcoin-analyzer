package com.bitcoin.analyzer;

import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class PredictResponse {

    @JsonProperty("requested_model")
    private String requestedModel;

    @JsonProperty("timestamps")
    private List<String> timestamps;

    @JsonProperty("actual_prices")
    private List<Double> actualPrices;

    @JsonProperty("predicted_prices")
    private List<Double> predictedPrices;

    public PredictResponse() {}

    // Getters
    public String getRequestedModel() { return requestedModel; }
    public List<String> getTimestamps() { return timestamps; }
    public List<Double> getActualPrices() { return actualPrices; }
    public List<Double> getPredictedPrices() { return predictedPrices; }

    // Setters
    public void setRequestedModel(String requestedModel) { this.requestedModel = requestedModel; }
    public void setTimestamps(List<String> timestamps) { this.timestamps = timestamps; }
    public void setActualPrices(List<Double> actualPrices) { this.actualPrices = actualPrices; }
    public void setPredictedPrices(List<Double> predictedPrices) { this.predictedPrices = predictedPrices; }
}