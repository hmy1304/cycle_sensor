#include <ESP8266WiFi.h>
#include <WebSocketsServer.h>

// ==========================================
// 최신 ESP8266 Mini 보드 핀 정의 (총 10개 핀 사용)
// 기판에 인쇄된 진짜 숫자(GPIO 번호)를 기준으로 합니다.
// ==========================================
#define TRIG_L 5  // 기판의 '5' 또는 'SCL' 핀
#define ECHO_L 4  // 기판의 '4' 또는 'SDA' 핀
#define TRIG_R 14 // 기판의 '14' 핀
#define ECHO_R 12 // 기판의 '12' 핀
#define TRIG_B 13 // 기판의 '13' 핀
#define ECHO_B 15 // 기판의 '15' 핀

#define BUZZER_PIN 16 // 기판의 '16' 핀

#define LED_R 0  // 기판의 '0' 핀
#define LED_G 2  // 기판의 '2' 핀
#define LED_B 3  // 기판의 'RX' 핀 (GPIO 3) - 출력으로 강제 개조됨!
// ==========================================

const int WARNING_DISTANCE = 100;
const int CRITICAL_DISTANCE = 20;

unsigned long previousMillis = 0;
int alertState = LOW; 
bool isBuzzerEnabled = false;

const char* ssid = "BikeRadar_AP";
const char* password = "password123";

WebSocketsServer webSocket = WebSocketsServer(81);

void webSocketEvent(uint8_t num, WStype_t type, uint8_t * payload, size_t length) {
    switch(type) {
        case WStype_DISCONNECTED:
            Serial.printf("[%u] 웹소켓 끊김\n", num);
            break;
        case WStype_CONNECTED: {
            Serial.printf("[%u] 웹소켓 연결됨\n", num);
        }
            break;
        case WStype_TEXT:
            String msg = String((char*)payload);
            if (msg == "BUZZER_ON") {
                isBuzzerEnabled = true;
            } else if (msg == "BUZZER_OFF") {
                isBuzzerEnabled = false;
                digitalWrite(BUZZER_PIN, LOW);
            }
            break;
    }
}

void setLEDColor(bool r, bool g, bool b) {
  digitalWrite(LED_R, r ? HIGH : LOW);
  digitalWrite(LED_G, g ? HIGH : LOW);
  digitalWrite(LED_B, b ? HIGH : LOW);
}

void setup() {
  Serial.begin(115200);
  delay(100); 
  
  // RX 핀(3번)을 일반 입출력(GPIO)으로 강제 전환
  pinMode(LED_B, FUNCTION_3); 

  pinMode(BUZZER_PIN, OUTPUT);
  digitalWrite(BUZZER_PIN, LOW);

  pinMode(TRIG_L, OUTPUT); pinMode(ECHO_L, INPUT);
  pinMode(TRIG_R, OUTPUT); pinMode(ECHO_R, INPUT);
  pinMode(TRIG_B, OUTPUT); pinMode(ECHO_B, INPUT);
  
  pinMode(LED_R, OUTPUT);
  pinMode(LED_G, OUTPUT);
  pinMode(LED_B, OUTPUT);
  setLEDColor(false, false, false); 
  
  Serial.println("\n[ESP8266] 자전거 레이더 AP 모드 시작...");
  
  WiFi.mode(WIFI_AP);
  WiFi.softAP(ssid, password);
  
  Serial.print("AP 시작 완료! IP 주소: ");
  Serial.println(WiFi.softAPIP());

  webSocket.begin();
  webSocket.onEvent(webSocketEvent);
}

int getSingleDistance(int trigPin, int echoPin) {
  digitalWrite(trigPin, LOW); delayMicroseconds(2);
  digitalWrite(trigPin, HIGH); delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  // 최대 측정 거리를 약 3.4m(20000us)로 제한하여 대기 시간을 줄임
  long duration = pulseIn(echoPin, HIGH, 20000); 
  
  int distance = duration * 0.034 / 2;
  if (duration == 0 || distance <= 2) return 999; 
  return distance;
}

int getDistance(int trigPin, int echoPin) {
  // [와이파이 끊김 없는 정밀도 개선법]
  // 와이파이 통신이 끼어들면 타이머가 밀려서 초음파 거리가 뻥튀기(비정상적으로 커짐)되는 특징이 있습니다.
  // 따라서 아주 빠르게 2번을 측정해서, 둘 중 더 '작은 값(정상 값)'을 채택하는 필터를 적용합니다.
  int dist1 = getSingleDistance(trigPin, echoPin);
  delay(15); 
  int dist2 = getSingleDistance(trigPin, echoPin);
  
  return min(dist1, dist2);
}

void loop() {
  webSocket.loop();

  // 센서 간 하울링 방지 딜레이
  int distL = getDistance(TRIG_L, ECHO_L); delay(40);
  int distR = getDistance(TRIG_R, ECHO_R); delay(40);
  int distB = getDistance(TRIG_B, ECHO_B); delay(40);

  int minDist = min(distL, min(distR, distB));

  String jsonString = "{\"left\": " + String(distL) + 
                     ", \"right\": " + String(distR) + 
                     ", \"back\": " + String(distB) + 
                     ", \"buzzer\": " + (isBuzzerEnabled ? "true" : "false") + "}";
  webSocket.broadcastTXT(jsonString);

  int alertInterval = 0; 
  unsigned long currentMillis = millis();

  if (minDist > WARNING_DISTANCE) {
    alertState = LOW;
  } else if (minDist <= CRITICAL_DISTANCE) {
    alertState = HIGH;
  } else {
    alertInterval = map(minDist, CRITICAL_DISTANCE, WARNING_DISTANCE, 50, 600);
    if (currentMillis - previousMillis >= alertInterval) {
      previousMillis = currentMillis;
      alertState = (alertState == LOW) ? HIGH : LOW;
    }
  }

  digitalWrite(BUZZER_PIN, isBuzzerEnabled ? alertState : LOW);

  if (alertState == HIGH) {
    if (minDist <= CRITICAL_DISTANCE) {
      setLEDColor(true, false, false);
    } else {
      setLEDColor(true, true, false);
    }
  } else {
    setLEDColor(false, false, false);
  }
  delay(10); 
}