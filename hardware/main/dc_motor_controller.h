/**
MotorController v.2
Supports both MOSFET-based and H-Bridge-based motor control.

Usage steps:
  1. Include the class header file:
      #include "dc_motor_controller.h"

  2. Create an instance of the class:

      // For MOSFET-based control (single PWM pin)
      motorController mc(ENA);

      // For H-Bridge-based control (PWM + direction pins)
      motorController mc(ENA, IN1, IN2, direction);

  3. Set motor speed:

      mc.setSpeed(<int>);  // Set speed (0-255)
      mc(<int>);           // Alternative using operator overloading

  4. Change direction (only for H-Bridge):

      mc.setDirection(<bool>);  // Set direction: true (clockwise), false (counterclockwise)
      mc(<bool>, <int>);        // Alternative: Set direction and speed together

  5. Stop the motor:

      mc.stop();
*/

class motorController {
  private:
    // Directions to abstract the motor direction
    static const bool clockwise = 1;
    static const bool counterclockwise = 0;

    int ENA;  // Motor speed control (PWM)
    int IN1;  // Motor direction control (H-Bridge mode)
    int IN2;  // Motor direction control (H-Bridge mode)
    bool motor_dir;  // Motor direction state
    bool isHBridge;  // True if using H-Bridge, false if using MOSFET

  public:
    /**
     * Constructor for MOSFET-based motor control.
     * @param enaPin - The PWM pin controlling motor speed.
     */
    motorController(int enaPin) : ENA(enaPin), isHBridge(false) {
      pinMode(ENA, OUTPUT);
    }

    /**
     * Constructor for H-Bridge-based motor control.
     * @param enaPin - The PWM pin controlling motor speed.
     * @param in1Pin - The IN1 pin for motor direction control.
     * @param in2Pin - The IN2 pin for motor direction control.
     * @param direction - Initial motor direction (default: clockwise).
     */
    motorController(int enaPin, int in1Pin, int in2Pin, bool direction = clockwise)
      : ENA(enaPin), IN1(in1Pin), IN2(in2Pin), motor_dir(direction), isHBridge(true) {
      pinMode(ENA, OUTPUT);
      pinMode(IN1, OUTPUT);
      pinMode(IN2, OUTPUT);
      setDirection(motor_dir);
    }

    /**
     * Set the motor direction (only applicable in H-Bridge mode).
     * @param direction - true for clockwise, false for counterclockwise.
     */
    void setDirection(bool direction) {
      if (!isHBridge) return; // Skip if using MOSFET-based control
      motor_dir = direction;
      digitalWrite(IN1, direction ? HIGH : LOW);
      digitalWrite(IN2, direction ? LOW : HIGH);
    }

    /**
     * Set the motor speed.
     * @param speed - Speed value (0-255).
     */
    void setSpeed(int speed) {
      analogWrite(ENA, constrain(speed, 0, 255));
    }

    /**
     * Stop the motor.
     */
    void stop() {
      analogWrite(ENA, 0);
      if (isHBridge) {
        digitalWrite(IN1, LOW);
        digitalWrite(IN2, LOW);
      }
    }

    /**
     * Operator overload: Set motor speed.
     * Example: mc(200); // Set speed to 200
     */
    void operator()(int speed) {
      setSpeed(speed);
    }

    /**
     * Operator overload: Set motor direction and speed (only in H-Bridge mode).
     * Example: mc(true, 180); // Set direction to clockwise and speed to 180
     */
    void operator()(bool direction, int speed) {
      if (isHBridge) setDirection(direction);
      setSpeed(speed);
    }
};