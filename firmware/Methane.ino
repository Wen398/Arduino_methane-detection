#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <ESP8266WiFiMulti.h>

ESP8266WiFiMulti WiFiMulti;

const char* ssid = "Your WiFi Name";
const char* password = "Your WiFi Password";

// Define the analog pin for the MQ-4 sensor
#define MQ4PIN A0

// Server endpoint configuration
const char* serverName = "http://Your computer IP:3000/update-data"; 

void setup() {
  Serial.begin(115200);

  WiFiMulti.addAP(ssid, password);

  while (WiFiMulti.run() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }

  Serial.println("Connected to WiFi");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
}

void loop() {
  int mq4Value = analogRead(MQ4PIN);  // Read the methane sensor value

  Serial.print("Methane concentration (raw value): ");
  Serial.println(mq4Value);

  if (WiFiMulti.run() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    if (http.begin(client, serverName)) {
      http.addHeader("Content-Type", "application/json");

      // Include the device ID and methane concentration in the data sent
      String httpRequestData = "{\"deviceId\":\"device1\", \"methane\":\"" + String(mq4Value) + "\"}";
      Serial.print("httpRequestData: ");
      Serial.println(httpRequestData);

      int httpResponseCode = http.POST(httpRequestData);

      if (httpResponseCode > 0) {
        String response = http.getString();
        Serial.println(httpResponseCode);
        Serial.println(response);
      } else {
        Serial.print("Error on sending POST: ");
        Serial.println(httpResponseCode);
      }

      http.end();
    } else {
      Serial.println("Unable to connect to server");
    }
  } else {
    Serial.println("WiFi Disconnected");
  }

  delay(8000); // Send data every 8 seconds
}
