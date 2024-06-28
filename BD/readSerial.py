import serial # pip install pyserial
import time

serial_port = 'COM3'   # verificar qual porta ta conectada

ser = serial.Serial(serial_port, 9600, timeout=1)

time.sleep(0.1) # dar tempo do Serial enviar
success = False
if ser.in_waiting > 0:
    lines = ser.readlines()
    for i in range(len(lines)):
        line = line[i].decode('utf-8').strip()
        if line != "[Gateway]: received message:": break
        success = True
        senderID = line[i+1].decode('utf-8').strip().split()[3]
        measurement = line[i+2].decode('utf-8').strip().split()[3]
ser.close()  # Fecha a comunicação
if success: print(senderID, measurement) #TODO: enviar pro banco de Dados
else: print("Message not received")
