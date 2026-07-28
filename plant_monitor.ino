#include <SoftwareSerial.h>

SoftwareSerial BT(2, 3); // RX, TX

// Sensor de humidade
const int sensorHumidade = A0;

// ======================================================
// Calibração
// Valores medidos no teu sensor com o sketch de diagnóstico:
// - seco (ao ar):        0
// - molhado (em água): 719
// Neste sensor, o valor SOBE quando está mais molhado
// (ao contrário de outros módulos, por isso a ordem aqui
// é diferente da versão anterior).
// ======================================================
const int VALOR_SECO = 0;
const int VALOR_MOLHADO = 719;

// Intervalo entre envios (ms). 1 segundo era demasiado rápido
// e sobrecarregava o BLE/o site com atualizações constantes.
const unsigned long INTERVALO_ENVIO = 5000;
unsigned long ultimoEnvio = 0;

void setup() {
    Serial.begin(9600);
    BT.begin(9600);
    Serial.println("Sistema iniciado.");
}

// Faz várias leituras e tira a média, para reduzir o ruído
// típico dos sensores resistivos de humidade.
int lerHumidadeMedia() {
    const int N_LEITURAS = 10;
    long soma = 0;

    for (int i = 0; i < N_LEITURAS; i++) {
        soma += analogRead(sensorHumidade);
        delay(10);
    }

    int valor = soma / N_LEITURAS;

    int humidade = map(valor, VALOR_SECO, VALOR_MOLHADO, 0, 100);
    humidade = constrain(humidade, 0, 100);

    return humidade;
}

void loop() {
    unsigned long agora = millis();

    if (agora - ultimoEnvio >= INTERVALO_ENVIO) {
        ultimoEnvio = agora;

        int humidade = lerHumidadeMedia();

        // Continua a mostrar tudo no Monitor Série, para poderes
        // confirmar/calibrar.
        Serial.print("Humidade: ");
        Serial.print(humidade);
        Serial.println("%");

        // Por Bluetooth envia SÓ o número, terminado por '\n'.
        // Isto evita que o site tenha de "adivinhar" qual número
        // extrair de uma frase, e permite-lhe juntar corretamente
        // pacotes BLE que cheguem partidos.
        BT.print(humidade);
        BT.print("\n");
    }
}
