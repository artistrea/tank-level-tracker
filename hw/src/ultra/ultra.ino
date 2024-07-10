#include <avr/sleep.h>
#include <Arduino.h>
#include "getMeasurement.h"

void setup() {
  Serial.begin(9600);
  // disable ADC with its clock too
 
  Serial.println("[sa]: finished setup");
}





void loop() {
  int measurementToSend = getMeasurement();
  Serial.println(measurementToSend);

  delay(400);

  Serial.flush();
}
