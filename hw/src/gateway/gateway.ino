
#ifndef OWN_ID
// gateway id is 0 for ease
#define OWN_ID 0
#endif

// lora and sleepyDog1
#include <stdint.h>
#include <avr/power.h>
#include <avr/sleep.h>
#include <Arduino.h>
#include <LoRa.h>
#include <LoRa_fns.h>
#include <longSleep.h>
// #include <Adafruit_SleepyDog.h>

void setup_gateway_lora() {
  if (!LoRa.begin(915E6)) {
    // deu bem ruim
    Serial.println("[Node]: deu bem ruim LoRa!");
    while(1);
  }

  LoRa_gatewayTxMode();

  // register the receive callback
  LoRa.onReceive(onReceive);

  LoRa_sendGatewayPollBroadcast();
  
  // put the radio into receive mode
  LoRa_gatewayRxMode();
}

void setup() {
  Serial.begin(9600);
  // disable ADC with its clock too
  ADCSRA = 0;
  // probably should disable more peripherals

  setup_gateway_lora();
  Serial.println("[Gateway]: finished setup");
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
  Serial.println("[Gateway]: received message:");
  Serial.print("[Gateway]: from - ");
  Serial.println((uint32_t)msg.senderId);
  Serial.print("[Gateway]: data - ");
  Serial.println((uint32_t)msg.data[0]);

// since using single lora without downstream notifications:
  // esp32.send(stuff)
  lastTransmissionAt = millis();
}

void loop() {
  // millis overflows in about every 50 days but is not relevant
  unsigned long now = millis();
  unsigned long timeElapsedSinceLastTransmissionReceived = now - lastTransmissionAt;

  if (timeElapsedSinceLastTransmissionReceived > 1000) {
    // probably no one is transmitting anymore
    LoRa.sleep();
    Serial.println("[Gateway]: finished receiving from all. Sleeping now zzz");
    Serial.flush();
    power_all_disable();
    longSleep(MINIMUM_TIME_BETWEEN_POLLING_IN_MS);
    power_all_enable();
    Serial.println("[Gateway]: waking up");

    LoRa_gatewayTxMode();
    
    LoRa_sendGatewayPollBroadcast();

    LoRa_gatewayRxMode();
  }
}
