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
            send_request('/samples', 
                        {"tank_id": senderID,
                        "top_to_liquid_distance_in_cm": measurement}
            )
    time.sleep(1) # dar tempo do Serial enviar
        

#ser.close() #nunca fecha a comunicação