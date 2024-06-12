#ifndef MINIMUM_TIME_BETWEEN_POLLING_IN_MS
// 50min = 1.000*60*50 ms = 3.000.000 ms
#define MINIMUM_TIME_BETWEEN_POLLING_IN_MS 3_000_000
#endif
#ifndef OWN_ID
// gateway id is 0 for ease
#define OWN_ID 1
#endif

// lora and sleepyDog
#include <avr/sleep.h>
#include <Arduino.h>
#include <LoRa.h>
#include <Adafruit_SleepyDog.h>
#include "../LoRa_fns.h"

void setup_lora() {
  if (!LoRa.begin(915E6)) {
    // deu bem ruim
    exit(1);
  }
  
  // register the receive callback
  LoRa.onReceive(onReceive);
  
  // put the radio into receive mode
  LoRa_prepareForGatewayPollBroadcast();
  LoRa_rxMode();
}

void setup() {
  setup_lora();
}

typedef enum STATE {
  SHOULD_SLEEP,
  SHOULD_TAKE_MEASUREMENT,
  SHOULD_WAIT_FOR_POLLING_BROADCAST,
  SHOULD_TRANSMIT,
} STATE;

STATE currentState = SHOULD_SLEEP;

uint32_t measurementToSend = 0;

void loop() {
  switch (currentState)
  {
  case SHOULD_SLEEP:
    // SETUP_LOW_POWER
    LoRa.sleep();
    ADCSRA &= ~(1 << ADEN);
    power_all_disable();
    Watchdog.sleep(MINIMUM_TIME_BETWEEN_POLLING_IN_MS);
    power_all_enable();
    currentState = SHOULD_WAIT_FOR_POLLING_BROADCAST;
    break;

  case SHOULD_WAIT_FOR_POLLING_BROADCAST:
    ADCSRA |= (1 << ADEN);
    // put the radio into receive mode
    LoRa_prepareForGatewayPollBroadcast();
    LoRa_rxMode();
    break;

  case SHOULD_TAKE_MEASUREMENT:
    // take measurement
    measurementToSend = 1;
    currentState = SHOULD_TRANSMIT;
    break;

  case SHOULD_TRANSMIT:
    LoRa_rxMode();
    LoRa_sendNodeMeasurement(measurementToSend);
    currentState = SHOULD_SLEEP;
    break;

  default:
    break;
  }
}

void onReceive(int packetSize) {
  // currentState is always waiting for broadcast
  // if downstream messages can be received, check currentState
  LoRa_prepareForGatewayPollBroadcastCleanup();
  currentState = SHOULD_TAKE_MEASUREMENT;
}