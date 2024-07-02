LIBERA AS PORTEIRA `sudo chmod a+rw /dev/ttyACM0`
OU `sudo -E env "PATH=$PATH"`

## How to compile?

Use [Arduino CLI](https://arduino.github.io/arduino-cli/1.0/installation/).

Compile referenciando o código compartilhado entre gateway e nó:

```bash
arduino-cli compile --build-property build.extra_flags=-DOWN_ID=10 --libraries ./src/shared/ --fqbn arduino:avr:uno ./src/node/node.ino
```

```bash
arduino-cli compile --libraries ./src/shared/ --fqbn arduino:avr:uno ./src/gateway/gateway.ino
```

Veja as placas conectadas ao seu computador:

```bash
arduino-cli board list
```

Dê upload para a placa desejada:

```bash
arduino-cli upload -p <porta-do-board> --fqbn arduino:avr:uno  ./src/node/node.ino
```

Monitore a comunicação serial da placa desejada:

```bash
arduino-cli monitor -p <porta-do-boardd>
```
