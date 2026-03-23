package com.bitcoin.analyzer;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class PredictionService {
    private final RestTemplate restTemplate;
    private final String PYTHON_API_URL = "http://127.0.0.1:8000/predict/";

    public PredictionService() {
        this.restTemplate = new RestTemplate();
    }

    public PredictResponse fetchPredictionFromPython(String modelType) {
        String fullUrl = PYTHON_API_URL + modelType;
        System.out.println("----------------------------------------");
        System.out.println("1. Spring Boot is calling: " + fullUrl);

        try {
            String rawJson = restTemplate.getForObject(fullUrl, String.class);
            System.out.println("2. Raw JSON from Python: " + rawJson);

            PredictResponse response = restTemplate.getForObject(fullUrl, PredictResponse.class);
            System.out.println("3. Successfully mapped to Java Record: " + response);
            System.out.println("----------------------------------------");

            return response;

        } catch (Exception e) {
            System.out.println("!!! ERROR in Service: " + e.getMessage());
            System.out.println("----------------------------------------");

            return new PredictResponse();
        }
    }
}
