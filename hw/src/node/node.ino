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
#define NTRIPS 60


uint32_t n_trips=0, not_received=0,
  rttm[NTRIPS], rttmi=0, awaket[NTRIPS], awaketi=0;
uint32_t measurementToSend = 0;
bool first_wait = true;
#define NTRIPS 10
uint32_t timeAwakeBefore = 0;
uint32_t timeAwakeAfter = 0;
uint32_t t1, t2, t3, t4, t5, t6, t7, t8, t9;

void loop() {
  switch (currentState) {
  case SHOULD_SLEEP:
    Serial.println("[Node]: gonna sleep zzz");
    timeAwakeAfter = millis();
    Serial.print("[Node]: time awake");
    Serial.println(timeAwakeAfter - timeAwakeBefore);
    awaket[awaketi++] = millis() - t9;

    if (n_trips == NTRIPS) {
      long long m = 0;
      for (int i=0;i<awaketi; i++) {
        m += awaket[i];
      }
      m/=awaketi;
      Serial.print("(time awake [média em ms]: ");
      Serial.print((int)m);
      Serial.println(")");
    }
    Serial.flush();
    // SETUP_LOW_POWER
    LoRa.sleep();
    ADCSRA &= ~(1 << ADEN);
    power_all_disable();
    longSleep(MINIMUM_TIME_BETWEEN_POLLING_IN_MS);
    power_all_enable();
    timeAwakeBefore = millis();
    t9 = millis();
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
    n_trips++;
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