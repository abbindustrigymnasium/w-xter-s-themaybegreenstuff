
//#include "74hc595n_4bit_status_display.h" Not required

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
MotorController motor(21, 0, 5000, LEDC_TIMER_8_BIT);
MotorController pump(19, 0, 5000, LEDC_TIMER_8_BIT);

#elif defined(ESP8266)
motorController motor()
#endif
// Create a websocket client instance
WebsocketsClient client;


// Had timing issues I didn't feel like fixing. Since it's not a requirenment, it's left out
//StatusDisplay sd(4,5,18);


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



// --------------- Helper Functions for diode_info_handler ---------------
struct diode_gpio_instance {
  uint8_t diode_id;
  uint8_t gpio_id;
};

const diode_gpio_instance diode_gpio_map[] = {
  {1, 18},
  {2, 19},
  {3, 20},
};
const size_t num_diodes = sizeof(diode_gpio_map) / sizeof(diode_gpio_map[0]);
int get_gpio(uint8_t diode_id) {
  for(size_t i = 0 ; i < num_diodes; i++) {
    if(diode_gpio_map[i].diode_id == diode_id) {
      return diode_gpio_map[i].gpio_id;
    }
  }
  return -1;
}
/** 
 * @brief Function intended to help the end user by giving an led interface displaying status of various of the programs function
 * @note diode 1 is for ws_connected_status
 * @note diode 2 is for ws_msg_recieved
 */
void diode_info_handler(uint8_t diode, bool status, bool flash = false, uint32_t flash_time = 500) {
  const uint8_t gpio_pin = get_gpio(diode);
  if (gpio_pin == -1) {
#ifdef DEBUG
    Serial.println("Programmed failed to write to diode: " + String(diode) + " no valid gpio convertion in diode_gpio_map");
#endif // DEBUG
    return;
  }
  pinMode(gpio_pin, OUTPUT);
  digitalWrite(gpio_pin, status);
  if(!flash) return; // if flash == false; return
  delay(flash_time);
  digitalWrite(gpio_pin, (!status));
  return;
}

void setup() {
  diode_info_handler(1, true); ///< Show not connected to web socket server
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
    diode_info_handler(2, true, true, 200);
  });

  client.onEvent([](WebsocketsEvent event, String data) {
    if (event == WebsocketsEvent::ConnectionOpened) {
      Serial.println("WebSocket connection opened");
      diode_info_handler(1, false);
    } else if (event == WebsocketsEvent::ConnectionClosed) {
      Serial.println("WebSocket connection closed");
      diode_info_handler(1, true);
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

  // Motor init
  if (motor.init() == ESP_OK) {
    Serial.println("Motor controller initialized successfully.");
  } else {
    Serial.println("Motor controller initialization failed.");
  }
}

void loop() {
  static bool motor_is_spinning_ = false;
  static bool pump_is_spinning_ = false;

  // Keep the WebSocket connection alive
  client.poll();

#if defined(ESP32)
  // Set motor speed according to greenhouse params instance
  if(gp.fan > 1) {
    if (!motor_is_spinning_) { ///< requred to "kickstart" the motor if it's not already spinning
      motor_is_spinning_ = true;
      motor.set_speed(255);
      delay(100);
    }
    motor.set_speed(map(gp.fan, 1, 255, 100, 255));
  } else {
    motor.stop();
    motor_is_spinning_ = false;
  }


  if(gp.pump > 1) {
    if(!pump_is_spinning_) {
      pump_is_spinning_ = true;
      pump.set_speed(255);
      delay(100);
    }
    pump.set_speed(map(gp.pump, 1, 255, 100, 255));
  } else {
    pump.stop();
    pump_is_spinning_ = false;
  }

#elif defined(ESP8266)

#endif

}
