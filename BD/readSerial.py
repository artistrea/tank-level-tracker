import serial # pip install pyserial
import time
import requests

DATABASE_PORT = 5000
BASE_URL = f'http://localhost:{DATABASE_PORT}'

def send_request(request, json_data):
    headers = {'Content-Type': 'application/json'}
    
    response = requests.post(BASE_URL+request, headers=headers, json=json_data)

    print(f'Status Code: {response.status_code}')
    print(f'Response Body: {response.text}')

STATE_WAITING_FOR_START = 0
STATE_WAITING_FOR_SENDER_ID = 1
STATE_WAITING_FOR_MEASUREMENT = 2

CURRENT_STATE = STATE_WAITING_FOR_START


serial_port = 'COM3'   # verificar qual porta ta conectada

ser = serial.Serial(serial_port, 9600, timeout=1)

while True:
    if ser.in_waiting > 0:
        line = ser.readline().decode('utf-8').strip()

        if CURRENT_STATE==STATE_WAITING_FOR_START:
            if line == "[Gateway]: received message:": # Achou o inicio da transmissao dos dados(id e medida)
                CURRENT_STATE = STATE_WAITING_FOR_SENDER_ID

        if CURRENT_STATE==STATE_WAITING_FOR_SENDER_ID:
            senderID = line.split()[3]
            CURRENT_STATE = STATE_WAITING_FOR_MEASUREMENT
        
        if CURRENT_STATE == STATE_WAITING_FOR_MEASUREMENT:
            measurement = line.split()[3]
            CURRENT_STATE = STATE_WAITING_FOR_START

        print("Nó", senderID, "Medida:", measurement) #TODO: enviar pro banco de Dados       
        send_request('/samples', 
                    {"tank_id": senderID,
                    "top_to_liquid_distance_in_cm": measurement}
        )
    time.sleep(0.1) # dar tempo do Serial enviar
        

#ser.close() #nunca fecha a comunicação