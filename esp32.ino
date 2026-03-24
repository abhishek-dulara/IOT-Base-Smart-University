#include <WiFi.h>
#include <HTTPClient.h>
#include <NTPClient.h>
#include <WiFiUdp.h>
#include <DHT.h>
#include <ArduinoJson.h>

// --- Network & Server Config ---
#define WIFI_SSID "vivo Y03"
#define WIFI_PASSWORD "11111111"

// IMPORTANT: Replace this IP with the local IP of your computer running Next.js
#define NEXTJS_SERVER_URL "http://<YOUR_COMPUTER_IP_ADDRESS>:3000/api/sensor_readings" 

// IMPORTANT: The target room in Supabase this data belongs to
#define TARGET_ROOM_ID "123e4567-e89b-12d3-a456-426614174000"

// --- Pin Definitions ---
#define DHTPIN 14 
#define DHTTYPE DHT11
const int ldrPin = 34;
const int pirPin = 13;
const int soundPin = 32;

// --- Objects ---
DHT dht(DHTPIN, DHTTYPE);
WiFiUDP ntpUDP;
NTPClient timeClient(ntpUDP, "pool.ntp.org", 19800); 

unsigned long lastUpdateMillis = 0;

void setup() {
  Serial.begin(115200);
  pinMode(pirPin, INPUT);
  pinMode(soundPin, INPUT);
  dht.begin();

  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  while (WiFi.status() != WL_CONNECTED) { delay(500); Serial.print("."); }
  Serial.println("\nWiFi Connected");
  Serial.print("ESP32 IP Address: ");
  Serial.println(WiFi.localIP());

  timeClient.begin();
}

void loop() {
  timeClient.update();
  if (millis() - lastUpdateMillis > 1000) { 
    lastUpdateMillis = millis();

    float h = dht.readHumidity();
    float t = dht.readTemperature();
    int ldr = analogRead(ldrPin);
    int pir = digitalRead(pirPin);

    // Sound Analysis
    unsigned int sampleWindow = 50; 
    unsigned int signalMax = 0, signalMin = 4095;
    unsigned long start = millis();
    while (millis() - start < sampleWindow) {
      int s = analogRead(soundPin);
      if (s < 4095) {
        if (s > signalMax) signalMax = s;
        else if (s < signalMin) signalMin = s;
      }
    }
    float dB = map(signalMax - signalMin, 0, 1000, 40, 95);
    if (dB < 40) dB = 40;

    bool isOcc = (pir == HIGH || dB > 75); 
    bool lightOn = (ldr < 2000); 

    // --- Serial Monitor Preview ---
    Serial.print(timeClient.getFormattedTime()); 
    Serial.print(" -> ");
    Serial.print("Light("); Serial.print(lightOn ? "ON" : "OFF"); Serial.print(") , ");
    Serial.print("PIR("); Serial.print(pir == HIGH ? "ON" : "OFF"); Serial.print(") , ");
    Serial.print(dB, 1); Serial.print("dB , ");
    Serial.print(t, 1); Serial.print("°C -> ");
    
    // --- Send to Next.js API ---
    if(WiFi.status() == WL_CONNECTED){
      HTTPClient http;
      
      http.begin(NEXTJS_SERVER_URL);
      http.addHeader("Content-Type", "application/json");
      
      // Build JSON Payload
      StaticJsonDocument<256> doc;
      doc["room_id"] = TARGET_ROOM_ID;
      
      // DHT handles NaN sometimes
      if (isnan(t)) doc["temp"] = 0; else doc["temp"] = t; 
      if (isnan(h)) doc["humidity"] = 0; else doc["humidity"] = h;
      
      doc["noise_level"] = dB;
      doc["is_occupied"] = isOcc;
      doc["light_status"] = lightOn;
      
      String requestBody;
      serializeJson(doc, requestBody);
      
      int httpResponseCode = http.POST(requestBody);
      
      if (httpResponseCode > 0) {
        Serial.print("Data pushed. API Code: ");
        Serial.println(httpResponseCode);
      } else {
        Serial.print("Failed to push. Error code: ");
        Serial.println(httpResponseCode);
      }
      
      http.end();
    } else {
      Serial.println("WiFi Disconnected! Please check connection.");
      WiFi.reconnect();
    }
  }
}
