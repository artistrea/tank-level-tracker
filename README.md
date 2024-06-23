# Trabalho de TR2

GRUPO 10 - LAG

Integrantes:

- Geraldo Teixeira do Nascimento Filho, 202024740
- Lucas Corrêa Boaventura, 211038262
- Artur Padovesi Piratelli, 211038208

## Estrutura do repositório

```
hw
└─ Pasta que contém código relacionado ao hardware (Arduíno)
web
└─ Pasta que contém código relacionado ao servidor na nuvem e apresentação no front (Next JS).
```

## Comunicação LoRa

Implementação:

1. Tempo mínimo entre medições combinado entre gateway e nós. No intervalo entre uma medição e outra os aparelhos podem dormir;
2. Após o tempo combinado ter passado, a comunicação se inicia com um broadcast do gateway, seguido pelos dados enviados pelos nós;

Considerações:

- Frequência utilizada é de [915 MHz](https://www.thethingsnetwork.org/docs/lorawan/frequencies-by-country/#b)
- 8 (+ 4) _preamble symbols_ para comunicação normal;
- 30 (ou outro número aleatório mas pré definidio) de símbolos para o broadcast de polling;
- _implicit header mode_ poderia ser utilizado pois o tamanho dos pacotes é conhecido. Parece que a biblioteca utilizada possui um problema com o modo, no entanto. ([issue](https://github.com/sandeepmistry/arduino-LoRa/issues/532))
- CRC do hardware utilizado;
- _Downlink_ com _Inverted IQ_ pra evitar interferência
