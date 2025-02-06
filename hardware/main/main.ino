//#include "74hc595n_4bit_status_display.h" // Not required

#include <DHT.h>
// Define the DHT pin and sensor type
#define DHTPIN  21        // DHT11 data pin
#define DHTTYPE DHT11     // DHT11 sensor type

#if defined(ESP32)
  #include <WiFi.h> // ESP32 WiFi library
  #include "motor_controller.h" // esp32 pwm controller
#elif defined(ESP8266)
  #include <ESP8266WiFi.h> // ESP8266 WiFi library
  #include "dc_motor_controller.h"
#endif

#define DEBUG ///< Output debug messages

#include <ArduinoWebsockets.h> // WebSocket library

using namespace websockets;

// Wi-Fi credentials
const char* ssid = "Hitachigymnasiet_2.4";
const char* password = "mittwifiarsabra";

// WebSocket server details
const char* server_url = "ws://10.22.5.5:3000/?type=embedded_device"; // WebSocket server URL 

#if defined(ESP32)
// Create an instance of MotorController
MotorController motor(23, LEDC_CHANNEL_0, 5000, LEDC_TIMER_8_BIT);
MotorController pump(18, LEDC_CHANNEL_1, 5000, LEDC_TIMER_8_BIT);

#elif defined(ESP8266)
motorController motor();
#endif

// Create a WebSocket client instance
WebsocketsClient client;

// Initialize DHT sensor
DHT dht(DHTPIN, DHTTYPE);

// Structure to hold the greenhouse parameters
struct greenhouse_params {
    uint8_t hatch;
    uint8_t fan;
    uint8_t pump;

    greenhouse_params() : hatch(1), fan(1), pump(1) {} // Initialize all values to 1 with a constructor 
};

greenhouse_params gp; ///< struct instance to store the values [1,255] for each controllable item

// Make sure inputs are in the span [0, 255] 
void parse_post(const String& res) {  
  // Extract values assuming structure: hatch,fan,pump
  uint8_t hatch, fan, pump;
  if (sscanf(res.c_str(), "%hhu,%hhu,%hhu", &hatch, &fan, &pump) == 3) {
    // Clamp values to range [0, 255]
    gp.hatch = constrain(hatch, 0, 255);
    gp.fan = constrain(fan, 0, 255);
    gp.pump = constrain(pump, 0, 255);
  } else {
    Serial.println("Error: Invalid input format");
    return;
  }

#ifdef DEBUG
  // Debug print of the received string
  Serial.println("Received: " + res);

  // Debug print of the extracted values
  Serial.println("Pump: " + String(gp.pump));
  Serial.println("Fan: " + String(gp.fan));
  Serial.println("Hatch: " + String(gp.hatch));
#endif // DEBUG
}

// Function to read sensor data and send it over the WebSocket
void read_sensor_data(void* parameter) {
  while (true) {
    // Read temperature as Celsius
    float temperature = dht.readTemperature();
    
    // Read humidity
    float humidity = dht.readHumidity();
    
    // Check if readings failed and exit early (if so)
    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
    } else {
      // Print the results to the Serial Monitor
      Serial.print("Temperature: ");
      Serial.print(temperature);
      Serial.print(" °C  ");
      Serial.print("Humidity: ");
      Serial.print(humidity);
      Serial.println(" %");

      // Send data over WebSocket (you can modify the data format as needed)
      String message = "{\"msg\":[\"" + String(temperature) + "\",\"" + String(humidity) + "\"],\"forward_to\":[\"val_database\"]}";
      client.send(message);
    }

    // Delay for 5 seconds before reading again
    vTaskDelay(5000 / portTICK_PERIOD_MS); // 5 seconds
  }
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

  // Motor initialization
#if defined(ESP32)
  if (motor.init() == ESP_OK) {
    Serial.println("Motor controller initialized successfully.");
  } else {
    Serial.println("Motor controller initialization failed.");
  }

  // Pump initialization 
  if (pump.init() == ESP_OK) {
    Serial.println("Pump controller initialized successfully.");
  } else {
    Serial.println("Pump controller initialization failed.");
  }
#endif

  dht.begin();

  // Create the task to read sensor data
  xTaskCreate(read_sensor_data, "ReadSensorData", 4096, NULL, 1, NULL);
}

void loop() {
  static bool motor_is_spinning_ = false;
  static bool pump_is_spinning_ = false;

  // Keep the WebSocket connection alive
  client.poll();

  // --- Reconnection Logic ---
  if (!client.connected()) {
    Serial.println("WebSocket connection lost. Attempting to reconnect...");
    // Try to reconnect. If the connection fails, wait a bit before retrying.
    if (client.connect(server_url)) {
      Serial.println("Reconnected to WebSocket server.");
    } else {
      Serial.println("Reconnection failed. Will retry shortly.");
      delay(5000); // Wait 5 seconds before trying again.
      return; // Skip the rest of the loop to avoid running control code while disconnected.
    }
  }
  // --- End Reconnection Logic ---

#if defined(ESP32)
  // Set motor speed according to greenhouse parameters
  if (gp.fan > 1) {
    if (!motor_is_spinning_) {
      motor_is_spinning_ = true;
      motor.set_speed(255);
      delay(100);
    }
    motor.set_speed(map(gp.fan, 1, 255, 100, 255));
  } else {
    motor.stop();
    motor_is_spinning_ = false;
  }

  if (gp.pump > 1) {
    if (!pump_is_spinning_) {
      pump_is_spinning_ = true;
      pump.set_speed(255);
      delay(100);
    }
    pump.set_speed(map(gp.pump, 1, 255, 100, 255));
  } else {
    pump.stop();
    pump_is_spinning_ = false;
  }
#endif
}
