#include <Arduino.h>
#include <WiFi.h>
#include <ESPAsyncWebServer.h>
#include "AsyncJson.h"
#include "ArduinoJson.h"
#include "DHT.h"

#define DHTPIN 4 //pino onde os dados do sensor chega ao esp32 (GPIO4)
#define DHTTYPE DHT11 //modelo do sensor (DHT11)
AsyncWebServer server(80);
const char *ssid = ""; //nome da rede wi-fi
const char *password = ""; //senha da rede wi-fi
void notFound(AsyncWebServerRequest *request){
  request->send(404, "application/json", "{\"message\":\"Not found\"}");
}
DHT dht(DHTPIN, DHTTYPE);
void setup(){
  dht.begin();
  Serial.begin(115200);
  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);
  while (WiFi.waitForConnectResult() != WL_CONNECTED){
    Serial.printf("WiFi Failed!\n");
  }

  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());

  server.on("/info", HTTP_GET, [](AsyncWebServerRequest * request){
    StaticJsonDocument<100> data;

    data["IP"] = WiFi.localIP();

    String response;
    serializeJson(data, response);
    request->send(200, "application/json", response);
  });

  server.on("/temp", HTTP_GET, [](AsyncWebServerRequest * request){
    float h = dht.readHumidity();
    float t = dht.readTemperature();
    StaticJsonDocument<100> data;

    data["temperature"] = t;
    data["humidity"] = h;

    String response;
    serializeJson(data, response);
    request->send(200, "application/json", response);
  });

  AsyncCallbackJsonWebHandler *handler = new AsyncCallbackJsonWebHandler("/post-message", [](AsyncWebServerRequest * request, JsonVariant & json){
    StaticJsonDocument<200> data;
    if (json.is<JsonArray>()){
      data = json.as<JsonArray>();
    }
    else if (json.is<JsonObject>()){
      data = json.as<JsonObject>();
    }
    String response;
    serializeJson(data, response);
    request->send(200, "application/json", response);
    Serial.println(response);
  });
  server.addHandler(handler);
  server.onNotFound(notFound);
  server.begin();
}
void loop(){
}
