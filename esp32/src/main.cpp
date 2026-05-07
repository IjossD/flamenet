#include <WiFi.h>
#include <HTTPClient.h>
#include <WiFiClientSecure.h>
#include <math.h>

// ─── WIFI ─────────────────────────────
#define WIFI_SSID     "yo"
#define WIFI_PASSWORD "josepH023"

// URL del servidor en Heroku (HTTPS)
#define API_URL        "https://flamenet-iot-1a089224172e.herokuapp.com/api/readings/save"
#define LED_STATUS_URL "https://flamenet-iot-1a089224172e.herokuapp.com/api/led/status"
#define ESP32_API_KEY  "flamenet_esp32_clave_2025"

// ─── Pines ────────────────────────────
#define MQ2_AO   32
#define MQ4_AO   34
#define MQ135_AO 33
#define LED_BLUE 2

#define RL 10.0
#define RATIO_AIRE_LIMPIO 4.0

// Curvas
#define MQ2_A  2.3
#define MQ2_B -0.45

#define MQ4_A  2.3
#define MQ4_B -0.44

#define MQ135_A  2.0
#define MQ135_B -0.42

// Umbrales
#define UMBRAL_MQ2   300
#define UMBRAL_MQ4   1000
#define UMBRAL_MQ135 400

float Ro_MQ2 = 10;
float Ro_MQ4 = 10;
float Ro_MQ135 = 10;

// ─── Funciones ────────────────────────
float leerVoltaje(int pin, int muestras = 50) {
  long suma = 0;
  for (int i = 0; i < muestras; i++) {
    suma += analogRead(pin);
    delay(2);
  }
  return (suma / (float)muestras / 4095.0) * 3.3;
}

float calcularRS(float v) {
  if (v < 0.01) v = 0.01;
  return RL * (3.3 - v) / v;
}

float calcularPPM(float rs, float Ro, float A, float B) {
  return pow(10, A + B * log10(rs / Ro));
}

const char* calcularEstado(float value) {
  if (value <= 50)  return "Normal";
  if (value <= 150) return "Precaución";
  if (value <= 300) return "Alerta";
  return "Peligro crítico";
}

// ─── Enviar datos ─────────────────────
void enviarDatos(float value, const char* estado, unsigned long timeMillis) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] WiFi desconectado");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure(); // Acepta cualquier certificado SSL

  HTTPClient http;
  http.setTimeout(10000);
  http.setConnectTimeout(10000);

  Serial.println("\n--- ENVIANDO DATOS ---");
  Serial.print("PPM: "); Serial.print(value, 2);
  Serial.print(" | Estado: "); Serial.print(estado);

  http.begin(client, API_URL);
  http.addHeader("Content-Type", "application/json");
  http.addHeader("x-api-key", ESP32_API_KEY);

  String json = "{\"value\":" + String(value, 2) +
                ",\"estado\":\"" + String(estado) +
                "\",\"time\":\"" + String(timeMillis) + "\"}";

  int httpCode = http.POST(json);

  if (httpCode == 200) {
    Serial.println("✓ EXITO - Datos guardados en base de datos");
  } else if (httpCode > 0) {
    Serial.print("✗ HTTP ERROR "); Serial.print(httpCode);
    Serial.print(" - "); Serial.println(http.errorToString(httpCode).c_str());
  } else {
    Serial.print("✗ CONEXION ERROR - "); Serial.println(http.errorToString(httpCode).c_str());
  }

  http.end();
}

// ─── Obtener estado del LED ───────────
void obtenerEstadoLED() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[ERROR] WiFi desconectado - LED no actualizado");
    return;
  }

  WiFiClientSecure client;
  client.setInsecure();

  HTTPClient http;
  http.setTimeout(10000);
  http.setConnectTimeout(10000);

  Serial.println("\n--- CONSULTANDO LED ---");

  http.begin(client, LED_STATUS_URL);
  http.addHeader("x-api-key", ESP32_API_KEY);

  int httpCode = http.GET();

  if (httpCode == 200) {
    String payload = http.getString();
    Serial.print("✓ Estado recibido: ");
    Serial.println(payload);

    if (payload.indexOf("\"led\":true") >= 0 || payload.indexOf("\"led\": true") >= 0) {
      digitalWrite(LED_BLUE, HIGH);
      Serial.println("  → LED AZUL ENCENDIDO");
    } else if (payload.indexOf("\"led\":false") >= 0 || payload.indexOf("\"led\": false") >= 0) {
      digitalWrite(LED_BLUE, LOW);
      Serial.println("  → LED AZUL APAGADO");
    }
  } else if (httpCode > 0) {
    Serial.print("✗ HTTP ERROR "); Serial.print(httpCode);
    Serial.print(" - "); Serial.println(http.errorToString(httpCode).c_str());
  } else {
    Serial.print("✗ CONEXION ERROR - "); Serial.println(http.errorToString(httpCode).c_str());
  }

  http.end();
}

// ─── Setup ────────────────────────────
void setup() {
  Serial.begin(115200);
  delay(1000);

  Serial.println("\n\n╔═══════════════════════════════════╗");
  Serial.println("║     FLAMENET - ESP32 SENSOR      ║");
  Serial.println("╚═══════════════════════════════════╝");

  pinMode(LED_BLUE, OUTPUT);
  digitalWrite(LED_BLUE, LOW);

  Serial.print("📡 Conectando WiFi: "); Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);

  int timeout = 0;
  while (WiFi.status() != WL_CONNECTED && timeout < 20) {
    delay(500);
    Serial.print(".");
    timeout++;
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n✓ WiFi conectado!");
    Serial.print("  IP: "); Serial.println(WiFi.localIP());
    Serial.print("  Servidor: "); Serial.println(API_URL);
  } else {
    Serial.println("\n✗ Error al conectar WiFi");
    return;
  }

  delay(2000);

  Serial.println("\n🔧 Calibrando sensores...");
  Ro_MQ2   = calcularRS(leerVoltaje(MQ2_AO, 100))   / RATIO_AIRE_LIMPIO;
  Ro_MQ4   = calcularRS(leerVoltaje(MQ4_AO, 100))   / RATIO_AIRE_LIMPIO;
  Ro_MQ135 = calcularRS(leerVoltaje(MQ135_AO, 100)) / RATIO_AIRE_LIMPIO;

  Serial.println("✓ Sensores calibrados");
  Serial.println("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
  Serial.println("Sistema listo. Iniciando ciclo...\n");
}

// ─── Loop ─────────────────────────────
void loop() {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("⚠ WiFi perdido, reconectando...");
    WiFi.reconnect();
    delay(5000);
    return;
  }

  float v2   = leerVoltaje(MQ2_AO);
  float v4   = leerVoltaje(MQ4_AO);
  float v135 = leerVoltaje(MQ135_AO);

  float ppm2   = calcularPPM(calcularRS(v2),   Ro_MQ2,   MQ2_A,   MQ2_B);
  float ppm4   = calcularPPM(calcularRS(v4),   Ro_MQ4,   MQ4_A,   MQ4_B);
  float ppm135 = calcularPPM(calcularRS(v135), Ro_MQ135, MQ135_A, MQ135_B);

  float value = max(ppm2, max(ppm4, ppm135));
  const char* estado = calcularEstado(value);

  enviarDatos(value, estado, millis());
  obtenerEstadoLED();

  Serial.println("═══════════════════════════════════\n");
  delay(5000);
}