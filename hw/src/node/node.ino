// lora and sleepyDog
#include <stdint.h>
#include <avr/power.h>
#include <avr/sleep.h>
#include <Arduino.h>
#include <LoRa.h>
#include <longSleep.h>
#include <LoRa_fns.h>
#include "getMeasurement.h"

typedef enum STATE {
  SHOULD_SLEEP,
  SHOULD_TAKE_MEASUREMENT,
  SHOULD_PREPARE_FOR_BROADCAST,
  SHOULD_WAIT_FOR_BROADCAST,
  SHOULD_TRANSMIT,
} STATE;

STATE currentState = SHOULD_SLEEP;

void setup_lora() {
  if (!LoRa.begin(915E6)) {
    // deu bem ruim
    Serial.println("[Node]: deu bem ruim LoRa!");
    while(1);
  }

  // register the receive callback
  LoRa.onReceive(onReceive);
}

void setup() {
  Serial.begin(9600);

  setup_lora();
 
  currentState = SHOULD_PREPARE_FOR_BROADCAST;

  Serial.print("[Node]: finished setup of node ");
  Serial.println(OWN_ID);
}


uint32_t measurementToSend = 0;
bool first_wait = true;

void loop() {
  switch (currentState) {
  case SHOULD_SLEEP:
    Serial.println("[Node]: gonna sleep zzz");
    Serial.flush();
    // SETUP_LOW_POWER
    LoRa.sleep();
    ADCSRA &= ~(1 << ADEN);
    power_all_disable();
    longSleep(MINIMUM_TIME_BETWEEN_POLLING_IN_MS);
    power_all_enable();
    // delay(1000);
    Serial.println("[Node]: stop sleep");
    currentState = SHOULD_PREPARE_FOR_BROADCAST;
    break;

  case SHOULD_PREPARE_FOR_BROADCAST:
    Serial.println("[Node]: SHOULD_PREPARE_FOR_BROADCAST");
    ADCSRA |= (1 << ADEN);
    // set next state before rx mode to prevent race condition if broadcast is immidiately received
    currentState = SHOULD_WAIT_FOR_BROADCAST;
    // put the radio into receive mode
    LoRa_nodeRxMode();
    LoRa_prepareForGatewayPollBroadcast();
    break;

  case SHOULD_WAIT_FOR_BROADCAST:
    if (first_wait) {
      first_wait = false;
      Serial.println("[Node]: SHOULD_WAIT_FOR_BROADCAST");
    }

    // just wait
    break;

  case SHOULD_TAKE_MEASUREMENT:
    first_wait = true;
    measurementToSend = getMeasurement();
    Serial.print("[Node]: SHOULD_TAKE_MEASUREMENT ");
    Serial.println(measurementToSend);
    currentState = SHOULD_TRANSMIT;
    break;

  case SHOULD_TRANSMIT:
    Serial.println("[Node]: SHOULD_TRANSMIT");
    LoRa_nodeTxMode();
    LoRa_sendNodeMeasurement(OWN_ID, measurementToSend);

    currentState = SHOULD_SLEEP;
    break;

  default:
    break;
  }
}

void onReceive(int packetSize) {
  // currentState is always waiting for broadcast
  // if downstream messages can be received, check currentState
  Serial.println("[Node]: Received broadcast");
  LoRa_prepareForGatewayPollBroadcastCleanup();
  currentState = SHOULD_TAKE_MEASUREMENT;
}