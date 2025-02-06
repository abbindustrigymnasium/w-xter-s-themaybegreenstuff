/**
 * @file main.cpp
 * @brief Greenhouse Controller Application
 *
 * This application reads temperature and humidity data from a DHT sensor,
 * sends the sensor data to a WebSocket server, and controls actuators
 * (fan motor and water pump) based on commands received from the server.
 *
 * Supported platforms: ESP32 (ESP8266 support may require further modifications).
 */

#include <Arduino.h>
#include <DHT.h>

// DHT Sensor configuration
#define DHTPIN  21        ///< Digital pin connected to the DHT sensor.
#define DHTTYPE DHT11     ///< DHT sensor type (DHT11).

#if defined(ESP32)
  #include <WiFi.h>                 ///< ESP32 WiFi library.
  #include "motor_controller.h"     ///< Motor controller library for ESP32.
#elif defined(ESP8266)
  #include <ESP8266WiFi.h>          ///< ESP8266 WiFi library.
  #include "dc_motor_controller.h"  ///< Motor controller library for ESP8266.
#else
  #error "Unsupported platform! This code supports only ESP32 and ESP8266."
#endif

#include <ArduinoWebsockets.h>       ///< WebSocket client library.
using namespace websockets;

// Uncomment the following line to enable debug messages.
// #define DEBUG

// Wi-Fi credentials
const char* ssid     = "Hitachigymnasiet_2.4";  ///< Your Wi-Fi SSID.
const char* password = "mittwifiarsabra";        ///< Your Wi-Fi password.

// WebSocket server configuration
const char* server_url = "ws://10.22.5.5:3000/?type=embedded_device";  ///< WebSocket server URL.

#if defined(ESP32)
  /// Motor controller instance for the fan (connected to pin 23).
  MotorController motor(23, LEDC_CHANNEL_0, 5000, LEDC_TIMER_8_BIT);

  /// Motor controller instance for the pump (connected to pin 18).
  MotorController pump(18, LEDC_CHANNEL_1, 5000, LEDC_TIMER_8_BIT);
#elif defined(ESP8266)
  // For ESP8266, instantiate the motor controller as needed.
  MotorController motor;  // Placeholder. Actual initialization may vary.
#endif

/// WebSocket client instance.
WebsocketsClient client;

/// DHT sensor instance.
DHT dht(DHTPIN, DHTTYPE);

/**
 * @brief Structure to hold greenhouse actuator parameters.
 *
 * Each parameter is an 8-bit value in the range [0, 255] that represents the desired
 * state or speed for the corresponding actuator.
 */
struct GreenhouseParams {
  uint8_t hatch; ///< Hatch control parameter (unused in actuator logic).
  uint8_t fan;   ///< Fan speed control parameter.
  uint8_t pump;  ///< Pump speed control parameter.

  /**
   * @brief Constructor: Initializes all parameters to 1.
   */
  GreenhouseParams() : hatch(1), fan(1), pump(1) {}
};

/// Global instance for storing greenhouse parameters.
GreenhouseParams gp;

#if defined(ESP32)
  // Static variables to hold the last applied actuator values.
  static uint8_t lastFan   = 0;
  static uint8_t lastPump  = 0;
  static bool motorIsSpinning = false;
  static bool pumpIsSpinning  = false;
#endif

/**
 * @brief Updates the actuators based on new parameters.
 *
 * This function is called when new parameters are received via WebSocket.
 * It only updates the actuator states if the parameter values have changed.
 */
void updateActuators() {
#if defined(ESP32)
  // Update fan actuator only if the value has changed.
  if (gp.fan != lastFan) {
    if (gp.fan > 1) {
      if (!motorIsSpinning) {
        motorIsSpinning = true;
        motor.set_speed(255);
        delay(100); // Brief delay to allow the motor to start.
      }
      // Map incoming value [1, 255] to an effective speed range [100, 255].
      motor.set_speed(map(gp.fan, 1, 255, 100, 255));
    } else {
      motor.stop();
      motorIsSpinning = false;
    }
    lastFan = gp.fan;
  }

  // Update pump actuator only if the value has changed.
  if (gp.pump != lastPump) {
    if (gp.pump > 1) {
      if (!pumpIsSpinning) {
        pumpIsSpinning = true;
        pump.set_speed(255);
        delay(100); // Brief delay to allow the pump to start.
      }
      // Map incoming value [1, 255] to an effective speed range [100, 255].
      pump.set_speed(map(gp.pump, 1, 255, 100, 255));
    } else {
      pump.stop();
      pumpIsSpinning = false;
    }
    lastPump = gp.pump;
  }
#endif
}

/**
 * @brief Parses a comma-separated string to update greenhouse parameters.
 *
 * The expected format of the input string is "hatch,fan,pump", where each value is an
 * unsigned integer. Parsed values are clamped to the range [0, 255].
 * If new values differ from the current ones, the actuator update is triggered.
 *
 * @param message The received command string.
 */
void parsePost(const String& message) {
  uint8_t hatch, fan, pump;
  if (sscanf(message.c_str(), "%hhu,%hhu,%hhu", &hatch, &fan, &pump) == 3) {
    uint8_t newFan  = constrain(fan, 0, 255);
    uint8_t newPump = constrain(pump, 0, 255);
    gp.hatch = constrain(hatch, 0, 255);

#ifdef DEBUG
    Serial.println("Received: " + message);
    Serial.println("Hatch: " + String(gp.hatch));
    Serial.println("Fan:   " + String(newFan));
    Serial.println("Pump:  " + String(newPump));
#endif

    // Update actuators only if the values have changed.
    if (newFan != gp.fan || newPump != gp.pump) {
      gp.fan  = newFan;
      gp.pump = newPump;
      updateActuators();
    }
  } else {
    Serial.println("Error: Invalid input format");
  }
}

/**
 * @brief Task function to read sensor data periodically and send it over the WebSocket.
 *
 * This function reads temperature and humidity data from the DHT sensor every 5 seconds.
 * If valid data is obtained, it formats the data as a JSON string and sends it to the
 * WebSocket server.
 *
 * @param parameter Unused task parameter.
 */
void readSensorData(void* parameter) {
  (void)parameter; // Unused parameter

  for (;;) {
    float temperature = dht.readTemperature();
    float humidity    = dht.readHumidity();

    if (isnan(temperature) || isnan(humidity)) {
      Serial.println("Failed to read from DHT sensor!");
    } else {
      Serial.print("Temperature: ");
      Serial.print(temperature);
      Serial.print(" °C  ");
      Serial.print("Humidity: ");
      Serial.print(humidity);
      Serial.println(" %");

      // Construct a JSON message. Adjust the format as needed.
      String message = "{\"msg\":[\"" + String(temperature) + "\",\"" + String(humidity) +
                       "\"],\"forward_to\":[\"val_database\"]}";
      client.send(message);
    }

    // Delay for 5 seconds (using FreeRTOS delay).
    vTaskDelay(5000 / portTICK_PERIOD_MS);
  }
}

/**
 * @brief Connects to the Wi-Fi network.
 */
void setupWiFi() {
  Serial.println("Connecting to Wi-Fi...");
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\nWi-Fi connected");
  Serial.print("IP Address: ");
  Serial.println(WiFi.localIP());
}

/**
 * @brief Configures and connects the WebSocket client.
 */
void setupWebSocket() {
  Serial.println("Connecting to WebSocket server...");

  // Set callback to handle incoming messages.
  client.onMessage([](WebsocketsMessage message) {
    parsePost(message.data());
  });

  // Set callback to handle WebSocket events.
  client.onEvent([](WebsocketsEvent event, String data) {
    switch (event) {
      case WebsocketsEvent::ConnectionOpened:
        Serial.println("WebSocket connection opened");
        break;
      case WebsocketsEvent::ConnectionClosed:
        Serial.println("WebSocket connection closed");
        break;
      case WebsocketsEvent::GotPing:
        Serial.println("Received Ping");
        break;
      case WebsocketsEvent::GotPong:
        Serial.println("Received Pong");
        break;
      default:
        break;
    }
  });

  // Connect to the WebSocket server.
  bool connected = client.connect(server_url);
  if (connected) {
    Serial.println("WebSocket client connected");
  } else {
    Serial.println("WebSocket client connection failed");
  }
}

/**
 * @brief Initializes the actuator controllers.
 *
 * For ESP32, this function initializes both the fan motor and the pump controller.
 */
void setupActuators() {
#if defined(ESP32)
  if (motor.init() == ESP_OK) {
    Serial.println("Motor controller initialized successfully.");
  } else {
    Serial.println("Motor controller initialization failed.");
  }

  if (pump.init() == ESP_OK) {
    Serial.println("Pump controller initialized successfully.");
  } else {
    Serial.println("Pump controller initialization failed.");
  }
#elif defined(ESP8266)
  // Add actuator initialization for ESP8266 as required.
  Serial.println("Actuator initialization for ESP8266 is not implemented.");
#endif
}

/**
 * @brief Arduino setup function.
 *
 * Initializes serial communication, Wi-Fi, WebSocket client, actuators, and the DHT sensor.
 * It also creates a FreeRTOS task to periodically read sensor data.
 */
void setup() {
  Serial.begin(115200);
  delay(10);

  setupWiFi();
  setupWebSocket();
  setupActuators();

  dht.begin();

  // Create a FreeRTOS task for reading sensor data.
  xTaskCreate(
    readSensorData,   // Task function.
    "ReadSensorData", // Task name.
    4096,             // Stack size.
    NULL,             // Task input parameter.
    1,                // Task priority.
    NULL              // Task handle.
  );
}

/**
 * @brief Arduino main loop function.
 *
 * Keeps the WebSocket connection alive. Actuator updates are triggered
 * immediately upon receiving new messages, so there is no need to update
 * actuators continuously in the loop.
 */
void loop() {
  client.poll();
}
