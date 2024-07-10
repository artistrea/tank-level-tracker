
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

typedef enum STATE {
  SHOULD_SLEEP,
  SHOULD_WAIT_FOR_ANSWERS,
  SHOULD_BROADCAST,
} STATE;

STATE currentState = SHOULD_BROADCAST;

void setup() {
  Serial.begin(9600);
  // disable ADC with its clock too
  ADCSRA = 0;
  // probably should disable more peripherals


  if (!LoRa.begin(915E6)) {
    // deu bem ruim
    Serial.println("[Gateway]: deu bem ruim LoRa!");
    while(1);
  }

  // register the receive callback
  LoRa.onReceive(onReceive);

  currentState = SHOULD_BROADCAST;
 
  Serial.println("[Gateway]: finished setup");
}
#define NTRIPS 60
uint32_t before_rtt, after_rtt=0;
uint32_t n_trips=0, not_received=0,
  rttm[NTRIPS], rttmi=0, awaket[NTRIPS], awaketi=0;
unsigned long lastTransmissionAt;
// since lora
void onReceive(int packetSize) {

  after_rtt = millis();

  Serial.print("[Gateway]: RTT in ms: ");
  Serial.println(after_rtt - before_rtt);
  rttm[rttmi++] = after_rtt - before_rtt;

  lastTransmissionAt = millis();
  not_received--;

  LoRaMessage msg = LoRa_receiveMessage(packetSize);
  // enable_timer();
  // cur_time = now();
  // can_downstream_at = cur_time + 1_000;
  // enqueue({msg, can_downstream_at});
  // queue consumer sends to server with esp32 and may enqueue downstream notifications
  uint32_t* measurement = (uint32_t*)msg.data;
  Serial.println("[Gateway]: received message:");
  Serial.print("[Gateway]: from - ");
  Serial.println(msg.senderId);
  Serial.print("[Gateway]: measurement - ");
  Serial.println(*measurement);


// since using single lora without downstream notifications:
  // esp32.send(stuff)
}
uint32_t t1, t2, t3, t4, t5, t6, t7, t8, t9;


void loop() {
  switch (currentState) {
    case SHOULD_WAIT_FOR_ANSWERS: {
      Serial.println("[Gateway]: SHOULD_WAIT_FOR_ANSWERS");
      // millis overflows in about every 50 days but is not relevant
      uint32_t now = millis();
      uint32_t timeElapsedSinceLastTransmissionReceived = now - lastTransmissionAt;

      if (timeElapsedSinceLastTransmissionReceived > 100) {
        currentState = SHOULD_SLEEP;
      }
      delay(100);
      break;
      }
    case SHOULD_BROADCAST:
      Serial.println("[Gateway]: SHOULD_BROAD");
      LoRa_gatewayTxMode();
      not_received++;
      
      n_trips++;
      before_rtt = millis();
      t1 = millis();
      LoRa_sendGatewayPollBroadcast();
      t2 = millis();
      Serial.print("tempo pro broadcast ser emitido ");
      Serial.println(t2-t1);
      // put the radio into receive mode
      LoRa_gatewayRxMode();
      currentState = SHOULD_WAIT_FOR_ANSWERS;
      lastTransmissionAt = millis();
      break;

    case SHOULD_SLEEP:
      Serial.println("[Gateway]: SHOULD_ZZZZ");
      LoRa.sleep();
      Serial.println("[Gateway]: finished receiving from all. Sleeping now zzz");
      Serial.flush();
      awaket[awaketi++] = millis() - t9;

      if (n_trips == NTRIPS) {
        Serial.print("stats: (rtt: ");
        long long m = 0;
        for (int i=0;i<rttmi; i++) {
          m += rttm[i];
        }
        m/=rttmi;
        Serial.print((int)m);
        m = 0;
        for (int i=0;i<awaketi; i++) {
          m += awaket[i];
        }
        m/=awaketi;
        Serial.print(") (time awake [média]: ");
        Serial.print((int)m);
        Serial.print(") (packets lost: ");
        Serial.print(not_received);
        Serial.print("/");
        Serial.print(n_trips);
        Serial.println();
      }
      power_all_disable();
      longSleep(MINIMUM_TIME_BETWEEN_POLLING_IN_MS);
      power_all_enable();
      t9 = millis();
      Serial.println("[Gateway]: waking up");
      currentState = SHOULD_BROADCAST;
      break;

    default:
      Serial.println("[Gateway]: SOMETHING GONE WRONG");
      break;
  }
  Serial.flush();
}
