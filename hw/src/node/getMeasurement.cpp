#include <Arduino.h>
#include <Ultrasonic.h>
#include "getMeasurement.h"

Ultrasonic ultrasonic(TRIGGER_PIN, ECHO_PIN);

uint32_t getMeasurement() {
    int sum = 0;
    for(int i=0; i < num_measures; i++) {
        sum += ultrasonic.read();
    }

    return sum/(float)num_measures;
}
