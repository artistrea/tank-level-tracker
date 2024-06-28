import serial # pip install pyserial
import time

serial_port = 'COM3'   # verificar qual porta ta conectada

ser = serial.Serial(serial_port, 9600, timeout=1)

while True:
    if ser.in_waiting > 0:
        lines = ser.readlines()
        for i in range(len(lines)):
            line = line[i].decode('utf-8').strip()
            if line != "[Gateway]: received message:": break # procurar o inicio da transmissao dos dados(id e medida)
            if len(lines[i+1:]) < 2: break # não capturou as duas mensagens com os dados
            senderID = lines[i+1].decode('utf-8').strip().split()[3]
            measurement = lines[i+2].decode('utf-8').strip().split()[3]
            print(senderID, measurement) #TODO: enviar pro banco de Dados
    time.sleep(1) # dar tempo do Serial enviar
        

#ser.close() #nunca fecha a comunicação
