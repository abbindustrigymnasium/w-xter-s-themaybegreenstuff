#define rclk_time 10
class StatusDisplay {
public:
  StatusDisplay(const uint8_t shift_pin, const uint8_t clk_pin, const uint8_t rclk_pin) : current_status(0), shift_pin_(shift_pin), clk_pin_(clk_pin), rclk_pin_(rclk_pin) {
    pinMode(shift_pin_, OUTPUT); ///< Set pin values
    pinMode(clk_pin_, OUTPUT);
    pinMode(rclk_pin_, OUTPUT);
  }

  void write_diode(uint8_t diode, bool status) {
    const byte mask = 1 << (diode - 1);  // Generate mask for the specified diode

    // Update the status of the specified diode
    const byte updated_status = (current_status_ & ~mask) | (status << (diode - 1));

    current_status_ = updated_status;
    shiftOut(shift_pin_, clk_pin_, LSBFIRST, current_status_); ///< Shift out the current status to update the diodes
    
  }

private:
  byte current_status_;  // Holds the current status of all diodes
  uint8_t shift_pin_;
  uint8_t clk_pin_;
  uint8_t rclk_pin_;
};
