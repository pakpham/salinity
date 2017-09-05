#include <ESP8266WiFi.h>
#include <PubSubClient.h>

//============== SENSOR TEMP AND HUM ==================

//================= JSONM LIB ===========================
#include <ArduinoJson.h>


// Cập nhật thông tin
// Thông tin về wifi
#define ssid "Loi PC"
#define password "4545@5454"
// Thông tin về MQTT Broker
#define mqtt_server "m12.cloudmqtt.com"
#define mqtt_topic_pub "Indicator/last-will"   
#define mqtt_topic_sub "Indicator/last-will"
  
#define mqtt_user "ESP8266_MCU"   
#define mqtt_pwd "123456"
#define SSPIN A0
const uint16_t mqtt_port = 12038;



// bien cho viec gui du lieu dinh ki===========================================
const long interval = 1000;
unsigned long previousMillis = 0;        // will store last time LED was updated
//==============================================================================
// ======================= DHT INIT =================================
// ================== == == == == == == == == == == == == == == == == == =

WiFiClient espClient;
PubSubClient client(espClient);

int counter = 0;
char state;
long lastMsg = 0;
char msg[50];
int value = 0;
void setup_wifi();
void callback(char* topic, byte* payload, unsigned int length);

void setup() {
  Serial.begin(115200);
  setup_wifi();
  client.setServer(mqtt_server, mqtt_port);
  client.setCallback(callback);
  //pinMode(  ledPin, OUTPUT);
}
// Hàm kết nối wifi
void setup_wifi() {
  delay(10);
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}
// call back để nhận dữ liệu
void callback(char* topic, byte* payload, unsigned int length) {
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    char receivedChar = (char)payload[i];
    Serial.print(receivedChar);
    //    if (receivedChar == '1')
    //      // Kiểm tra nếu tin nhận được là 1 thì bật LED và ngược lại
    //      digitalWrite(ledPin, HIGH);
    //    if (receivedChar == '0')
    //      digitalWrite(ledPin, LOW);
  }
  Serial.println();
}
void reconnect() {
  // Chờ tới khi kết nối
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    if (client.connect("ESP8266Client", mqtt_user, mqtt_pwd)) {
      Serial.println("connected");
      client.publish(mqtt_topic_pub, "ESP_reconnected");
      client.subscribe(mqtt_topic_sub);
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Đợi 5s
      delay(5000);
    }
  }
}
void temp_send() {
  value = map (analogRead (SSPIN),1024,0,0,1000);

  StaticJsonBuffer<200> jsonBuffer;
  //================= Create Array ============================
  //JsonArray& array = jsonBuffer.createArray();
  //  array.add(t);
  //  array.add("hum");
  //================== Create Object  ==========================
  JsonObject& object = jsonBuffer.createObject();
  object["S1"] = value / 100;
  object["S2"] =  value - (value / 100) * 100;


  char buffer[256];
  object.printTo(buffer, sizeof(buffer));
  object.prettyPrintTo(Serial);
  Serial.println ();



  //================== Pub MQTT ==================================
  //client.publish(mqtt_topic_pub, String(t).c_str());
  client.publish("Indicator1/message",  buffer);
  //client.publish ("temp1", "{\"temp\":131.22,\"hum\":67}");
}
void loop() {

  // Kiểm tra kết nối
  if (!client.connected()) {
    reconnect();
  }

  // GUI DU LIEU DINH KY ++++++++++++++++++++++
  unsigned long currentMillis = millis();
  if (currentMillis - previousMillis >= interval) {
    previousMillis = currentMillis;
    temp_send ();
  }
  client.loop();

}
