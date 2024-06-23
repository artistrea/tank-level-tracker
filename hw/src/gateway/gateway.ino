
#ifndef MINIMUM_TIME_BETWEEN_POLLING_IN_MS
// 50min = 1000*60*50 ms = 3000000 ms
#define MINIMUM_TIME_BETWEEN_POLLING_IN_MS 3000000
#endif
#ifndef OWN_ID
// gateway id is 0 for ease
#define OWN_ID 0
#endif

// lora and sleepyDog
#include <avr/sleep.h>
#include <Arduino.h>
#include <LoRa.h>
#include "../LoRa_fns.h"
#include <Adafruit_SleepyDog.h>

void setup_gateway_lora() {
  LoRa_txMode();

  // register the receive callback
  LoRa.onReceive(onReceive);

  LoRa_sendGatewayPollBroadcast();
  
  // put the radio into receive mode
  LoRa_rxMode();
}

void setup() {
  // disable ADC with its clock too
  ADCSRA = 0;
  // probably should disable more peripherals

  setup_gateway_lora();
}

unsigned long lastTransmissionAt;
// since lora
void onReceive(int packetSize) {
  LoRaMessage msg = LoRa_receiveMessage(packetSize);
  // enable_timer();
  // cur_time = now();
  // can_downstream_at = cur_time + 1_000;
  // enqueue({msg, can_downstream_at});
  // queue consumer sends to server with esp32 and may enqueue downstream notifications

// since using single lora without downstream notifications:
  // esp32.send(stuff)
  lastTransmissionAt = millis();
}

void loop() {
  // millis overflows in about every 50 days but is not relevant
  unsigned long now = millis();
  unsigned long timeElapsedSinceLastTransmissionReceived = now - lastTransmissionAt;

  if (timeElapsedSinceLastTransmissionReceived > 1) {
    // probably no one is transmitting anymore
    LoRa.sleep();
    
    power_all_disable();
    Watchdog.sleep(MINIMUM_TIME_BETWEEN_POLLING_IN_MS);
    power_all_enable();
  }
}
