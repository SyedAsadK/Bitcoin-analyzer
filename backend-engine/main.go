package main

import (
	"encoding/json"
	"net/http"
	"strings"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

type PredictData struct {
	RequestedModel  string    `json:"requested_model"`
	TimeStamps      []string  `json:"timestamps"`
	ActualPrices    []*float32 `json:"actual_prices"`
	PredictedPrices []*float32 `json:"predicted_prices"`
}

func getModel(c *gin.Context) {
	model := strings.ToUpper(c.Param("modelType"))
	response, err := http.Get("http://localhost:8000/predict/" + model)
if err != nil {
		c.JSON(500, gin.H{"error": "Failed to call ML engine"})
		return
	}
	defer response.Body.Close()
	data := PredictData{}
if err := json.NewDecoder(response.Body).Decode(&data); err != nil {
		c.JSON(500, gin.H{"error": "Failed to parse ML response"})
		return
	}
c.JSON(200, data)
}

func main() {
	r := gin.Default()
	r.Use(cors.Default())
	r.GET("/api/predict/:modelType", getModel)

	r.Run()
}
