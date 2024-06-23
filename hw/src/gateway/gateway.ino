
#include <avr/sleep.h>
#include <avr/power.h>
// lora and sleepyDog
#include <LoRa.h>
#include <Adafruit_SleepyDog.h>

#ifndef MINIMUM_TIME_BETWEEN_CALLS_IN_MS
// 50min = 1000*60*50 ms = 3000000 ms
#define MINIMUM_TIME_BETWEEN_CALLS_IN_MS 3000000
#endif

void setup_low_power() {
  // disable ADC
  ADCSRA = 0;  

  // turn off various modules
  power_all_disable();
  
  set_sleep_mode(SLEEP_MODE_IDLE);  
  noInterrupts();           // timed sequence follows
  sleep_enable();
 
  // turn off brown-out enable in software
  MCUCR = bit (BODS) | bit (BODSE);
  MCUCR = bit (BODS); 
  interrupts();             // guarantees next instruction executed
  sleep_cpu();              // sleep within 3 clock cycles of above    
}

void setup_lora() {
  if (!LoRa.begin(915E6)) {
    // deu bem ruim
    exit(1);
  }
  
  // register the receive callback
  LoRa.onReceive(onReceive);
  
  // put the radio into receive mode
  LoRa.receive();
}

void setup() {
  setup_lora();

  setup_low_power();
}

// since lora
void onReceive(int packetSize) {
  // received a packet
  for (int i = 0; i < packetSize; i++) {
//    pega uuid a chamar e enviar depois
    LoRa.read();
  }

//  enviar pacotes pro nós

  delay(1000);

  Lora.end();

  Watchdog.sleep(MINIMUM_TIME_BETWEEN_CALLS_IN_MS);

  setup_lora();
}

void loop() {}
