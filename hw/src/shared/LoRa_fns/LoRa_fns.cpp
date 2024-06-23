#include <stdint.h>
#include <LoRa.h>
#include <Arduino.h>
#include "LoRa_fns.h"

// Gateway - Sends messages with enableInvertIQ()
//         - Receives messages with disableInvertIQ()
// Node    - Sends messages with disableInvertIQ()
//         - Receives messages with enableInvertIQ()

void LoRa_gatewayRxMode(){
// Node    - Receives messages with enableInvertIQ()
  LoRa.enableInvertIQ();                // active invert I and Q signals
  LoRa.receive();                       // set receive mode
}
void LoRa_nodeRxMode(){
// Gateway - Receives messages with disableInvertIQ()
  LoRa.disableInvertIQ();               // normal mode
  LoRa.receive();                       // set receive mode
}

void LoRa_gatewayTxMode(){
// Node    - Sends messages with disableInvertIQ()
  LoRa.idle();                          // set standby mode
  LoRa.disableInvertIQ();               // normal mode
  // to not let nodes talk at same time
  LoRa.onCadDone(onCADdone);
}
void LoRa_nodeTxMode(){
// Gateway - Sends messages with enableInvertIQ()
  LoRa.idle();                          // set standby mode
  LoRa.enableInvertIQ();                // active invert I and Q signals
}

// returns 0 on failure, 1 on success
// https://github.com/sandeepmistry/arduino-LoRa/blob/master/API.md#sending-data
int LoRa_sendPacket(byte* buffer, size_t length) {
  // 255 bytes per packet
  if (length > 255) return 0;

  int begun = 0;
  int implicit_header = 0;
  do {
    begun = LoRa.beginPacket(implicit_header);

    if (!begun) delayMicroseconds(random(1, 1000));
  } while (!begun);

  size_t written = LoRa.write(buffer, length);

  if (written != length) {
    return 0;
  }

  return LoRa.endPacket();
}

bool channelBusy = false;

// LoRa.begin() has to have been called
// blocks while has not sent message
void LoRa_sendNodeMeasurement(byte fromId, uint32_t measurement) {
  struct LoRaMessage msg;
  msg.senderId = fromId;
  memcpy(msg.data, &measurement, sizeof(measurement));

  LoRa_sendMessage(msg);
}

void LoRa_sendMessage(LoRaMessage &msg) {
  while (channelBusy) {
    delayMicroseconds(random(1, 100));
  }

  int success = 0;

  do {
    success = LoRa_sendPacket(((byte*)&msg), sizeof(msg));
    if (!success) {
      delayMicroseconds(random(1, 100));
    }
  } while (!success);
}

void onCADdone(boolean detected) {
  channelBusy = detected;
}

LoRaMessage& LoRa_receiveMessage(int packetSize) {  
  LoRaMessage msg;
  byte* buffer;
  LoRa.readBytes(buffer, sizeof(msg));
  memcpy(&msg, buffer, sizeof(msg));

  return msg;
}

void LoRa_sendGatewayPollBroadcast() {
  LoRa.setPreambleLength(BROADCAST_PREAMBLE_LENGTH);

  byte packet[1];

  LoRa_sendPacket(packet, sizeof(packet));

  Serial.println("sent broadcast");

  // 8 is the default
  LoRa.setPreambleLength(8);
}

void LoRa_prepareForGatewayPollBroadcast() {
  LoRa.setPreambleLength(BROADCAST_PREAMBLE_LENGTH);
}

void LoRa_prepareForGatewayPollBroadcastCleanup() {
  // 8 is the default
  LoRa.setPreambleLength(8);
}
