#if defined(ESP32)
#include <WiFi.h> // ESP32 WiFi library
#elif defined(ESP8266)
#include <ESP8266WiFi.h> // ESP8266 WiFi library
#endif

#include <ArduinoWebsockets.h> // WebSocket library

using namespace websockets;

// Wi-Fi credentials
const char* ssid = "Hitachigymnasiet_2.4";
const char* password = "mittwifiarsabra";

// WebSocket server details
const char* server_url = "ws://10.22.5.5:3001/?client_type=client"; // WebSocket server URL 

WebsocketsClient client;

struct greenhouse_params {
  uint8_t hatch;
  uint8_t fan;
  uint8_t pump;
};

greenhouse_params gp; ///< struct instance to store the values [0,255] for each controllable item

void parse_post(String res) {
  Serial.println(res);
  int res_int = res.toInt(); // Convert to int (validate if needed)

  // Extract each byte using bitmask and bit-shifting
  gp.hatch = (res_int & 0xFF);         // First byte
  gp.fan = (res_int >> 8) & 0xFF;      // Second byte
  gp.pump = (res_int >> 16) & 0xFF;    // Third byte

  // Debugging output
  Serial.println("Parsed Values:");
  Serial.print("Hatch: ");
  Serial.println(gp.hatch);
  Serial.print("Fan: ");
  Serial.println(gp.fan);
  Serial.print("Pump: ");
  Serial.println(gp.pump);
}

void setup() {
    Serial.begin(115200);
    delay(10);

    // Connect to Wi-Fi
    Serial.println("Connecting to Wi-Fi...");
    WiFi.begin(ssid, password);

    while (WiFi.status() != WL_CONNECTED) {
        delay(500);
        Serial.print(".");
    }
    Serial.println("\nWi-Fi connected");
    Serial.print("IP Address: ");
    Serial.println(WiFi.localIP());
    // Connect to WebSocket server
    Serial.println("Connecting to WebSocket server...");
    client.onMessage([](WebsocketsMessage message) {
        parse_post(message.data());
    });

    client.onEvent([](WebsocketsEvent event, String data) {
        if (event == WebsocketsEvent::ConnectionOpened) {
            Serial.println("WebSocket connection opened");
        } else if (event == WebsocketsEvent::ConnectionClosed) {
            Serial.println("WebSocket connection closed");
        } else if (event == WebsocketsEvent::GotPing) {
            Serial.println("Received Ping");
        } else if (event == WebsocketsEvent::GotPong) {
            Serial.println("Received Pong");
        }
    });

    bool connected = client.connect(server_url);
    if (connected) {
        Serial.println("WebSocket client connected");
    } else {
        Serial.println("WebSocket client connection failed");
    }
}

void loop() {
    // Keep the WebSocket connection alive
    client.poll();
}
