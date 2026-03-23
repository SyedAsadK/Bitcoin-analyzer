package com.bitcoin.analyzer;

import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.client.RestTemplate;

@RestController
public class PredictionController {
    private final PredictionService predictionService;
    public PredictionController(PredictionService predictionService){
        this.predictionService = predictionService;
    }

    @GetMapping("/api/predict/{model}")
    @CrossOrigin(origins = "http://localhost:3000")
    public PredictResponse getPrediction(@PathVariable String model){
        return predictionService.fetchPredictionFromPython(model);
    }
    @GetMapping("/api/raw/{model}")
    public String getRawPrediction(@PathVariable String model) {
        RestTemplate restTemplate = new RestTemplate();
        String url = "http://127.0.0.1:8000/predict/" + model;
        return restTemplate.getForObject(url, String.class);
    }




}
;