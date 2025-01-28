// MotorController
// TODO:
//  - Implement "kickstart" function for starting a stopped motor
//  - Implement percentage controller to simplify away from using duty_cycle


#ifndef MOTOR_CONTROLLER_H
#define MOTOR_CONTROLLER_H

#include <Arduino.h>
#include "driver/ledc.h"

class MotorController {
public:
  // Constructor
  MotorController(int pwm_pin, int pwm_channel = 0, int pwm_frequency = 5000, int pwm_resolution = LEDC_TIMER_8_BIT, ledc_mode_t speed_mode = LEDC_HIGH_SPEED_MODE, ledc_timer_t timer_num = LEDC_TIMER_0, ledc_clk_cfg_t clk_cfg = LEDC_AUTO_CLK)
      : pwm_pin_(pwm_pin), pwm_channel_(static_cast<ledc_channel_t>(pwm_channel)), pwm_frequency_(pwm_frequency), pwm_resolution_(pwm_resolution), speed_mode_(speed_mode), timer_num_(timer_num), clk_cfg_(clk_cfg) {}

  // Initialize the PWM settings
  esp_err_t init() {
    // Configure the LEDC timer
    ledc_timer_config_t ledc_timer = {
        .speed_mode = speed_mode_,
        .duty_resolution = static_cast<ledc_timer_bit_t>(pwm_resolution_),
        .timer_num = timer_num_,
        .freq_hz = pwm_frequency_,
        .clk_cfg = clk_cfg_
    };
    esp_err_t err = ledc_timer_config(&ledc_timer);
    if (err != ESP_OK) {
      Serial.printf("Failed to configure LEDC timer: %s\n", esp_err_to_name(err));
      return err;
    }

    // Configure the LEDC channel
    ledc_channel_config_t ledc_channel = {
        .gpio_num = pwm_pin_,
        .speed_mode = speed_mode_,
        .channel = pwm_channel_,
        .intr_type = LEDC_INTR_DISABLE,
        .timer_sel = timer_num_,
        .duty = 0, // Set duty cycle to 0%
        .hpoint = 0
    };
    err = ledc_channel_config(&ledc_channel);
    if (err != ESP_OK) {
      Serial.printf("Failed to configure LEDC channel: %s\n", esp_err_to_name(err));
    }
    return err;
  }

  /**
   * @brief Function to control the speed of the motor
   * @param speed duty_cycle of the pwm output, by default, the range is [0-255] (uint8_t)
   */
  esp_err_t set_speed(int speed) {
    // Ensure duty cycle is within the valid range
    int max_duty = (1 << pwm_resolution_) - 1;
    if (speed < 0) speed = 0;
    if (speed > max_duty) speed = max_duty;

    // Set the duty cycle
    esp_err_t err = ledc_set_duty(speed_mode_, pwm_channel_, speed);
    if (err != ESP_OK) {
      Serial.printf("Failed to set duty: %s\n", esp_err_to_name(err));
      return err;
    }

    // Update duty to apply the new value
    err = ledc_update_duty(speed_mode_, pwm_channel_);
    if (err != ESP_OK) {
      Serial.printf("Failed to update duty: %s\n", esp_err_to_name(err));
    }
    return err;
  }

  /**
   * @brief abstaction function that simply sets the motor speed to 0
   */
  esp_err_t stop() {
    return set_speed(0);
  }

private:
  int pwm_pin_;
  ledc_channel_t pwm_channel_;
  int pwm_frequency_;
  int pwm_resolution_;
  ledc_mode_t speed_mode_;
  ledc_timer_t timer_num_;
  ledc_clk_cfg_t clk_cfg_;
};

#endif // MOTOR_CONTROLLER_H
