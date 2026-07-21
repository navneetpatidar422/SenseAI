export const SENSORS_DATA = [
  {
    slug: 'mq-135',
    name: 'MQ-135 Air Quality Sensor',
    category: 'Gas',
    description: 'Semiconductor gas sensor used for detecting air quality, NH3, NOx, alcohol, benzene, smoke, and CO2 in domestic and industrial environments.',
    aliases: ['MQ135', 'Air Quality Sensor', 'Air Pollution Sensor'],
    specs: {
      voltage: '5.0V ± 0.1V DC',
      interface: 'Analog (0-5V) & Digital (TTL Threshold)',
      range: '10ppm - 1000ppm NH3, 10-1000ppm Benzene, 10-300ppm Alcohol',
      accuracy: '±5% full scale after preheating',
      powerConsumption: '150mA (Heater ON)',
    },
    pinout: [
      { pin: 'VCC', function: 'Power Supply', note: 'Requires 5V DC for heater element' },
      { pin: 'GND', function: 'Ground', note: 'Common ground' },
      { pin: 'AOUT', function: 'Analog Output', note: 'Voltage proportional to gas concentration' },
      { pin: 'DOUT', function: 'Digital Output', note: 'TTL high/low based on onboard potentiometer threshold' },
    ],
    sampleCode: {
      arduino: `// MQ-135 Basic Analog Read
const int mqPin = A0;

void setup() {
  Serial.begin(9600);
  pinMode(mqPin, INPUT);
}

void loop() {
  int sensorValue = analogRead(mqPin);
  float voltage = sensorValue * (5.0 / 1023.0);
  Serial.print("Sensor Value: ");
  Serial.print(sensorValue);
  Serial.print(" | Voltage: ");
  Serial.println(voltage);
  delay(1000);
}`,
      python: `# Raspberry Pi Python MQ-135 via ADS1115 ADC
import time
import board
import busio
import adafruit_ads1x15.ads1115 as ADS
from adafruit_ads1x15.analog_in import AnalogIn

i2c = busio.I2C(board.SCL, board.SDA)
ads = ADS.ADS1115(i2c)
chan = AnalogIn(ads, ADS.P0)

while True:
    print(f"Voltage: {chan.voltage:.3f}V | Raw Value: {chan.value}")
    time.sleep(1)`
    },
    calibrationGuide: 'Burn-in heating period of 24 to 48 hours is required before accurate readings. Measure R0 in clean air (400ppm CO2 baseline) using R0 = Rs / 3.6.',
    industrialUse: 'Factory ambient air monitoring, HVAC ventilation control systems, gas leak detection panels, environmental compliance loggers.',
    commonMistakes: [
      'Powering with 3.3V instead of 5V (heater will not reach operational temperature)',
      'Skipping the 24-hour preheat burn-in period',
      'Using digital threshold DOUT for quantitative PPM measurements'
    ]
  },
  {
    slug: 'dht22',
    name: 'DHT22 / AM2302 Temperature & Humidity Sensor',
    category: 'Environmental',
    description: 'Capacitive humidity and thermistor temperature sensor with digital single-bus output signal.',
    aliases: ['DHT22', 'AM2302', 'DHT-22'],
    specs: {
      voltage: '3.3V - 6V DC',
      interface: 'Single-bus Digital Custom Protocol',
      range: 'Humidity: 0-100% RH | Temp: -40 to 80°C',
      accuracy: 'Humidity: ±2-5% RH | Temp: ±0.5°C',
      powerConsumption: '1.5mA (Measuring), 40uA (Standby)',
    },
    pinout: [
      { pin: 'VCC', function: 'Power', note: '3.3V to 5V' },
      { pin: 'DATA', function: 'Serial Data', note: 'Requires 4.7k-10k pull-up resistor to VCC' },
      { pin: 'NC', function: 'Not Connected', note: 'Leave floating' },
      { pin: 'GND', function: 'Ground', note: 'Common ground' },
    ],
    sampleCode: {
      arduino: `#include <DHT.h>
#define DHTPIN 2
#define DHTTYPE DHT22
DHT dht(DHTPIN, DHTTYPE);

void setup() {
  Serial.begin(9600);
  dht.begin();
}

void loop() {
  float h = dht.readHumidity();
  float t = dht.readTemperature();
  if (isnan(h) || isnan(t)) {
    Serial.println("Failed to read from DHT sensor!");
    return;
  }
  Serial.print("Humidity: "); Serial.print(h);
  Serial.print("% | Temp: "); Serial.print(t); Serial.println("°C");
  delay(2000);
}`
    },
    calibrationGuide: 'Factory calibrated with stored coefficients in OTP memory. No manual calibration needed; poll maximum once every 2 seconds.',
    industrialUse: 'Greenhouse climate control, server room environmental monitoring, cold storage logistics.',
    commonMistakes: [
      'Polling faster than 0.5Hz (2 second interval)',
      'Forgetting 10k Ohm pull-up resistor on DATA line',
      'Exposing sensor to direct condensation or liquid water'
    ]
  },
  {
    slug: 'bmp280',
    name: 'BMP280 Barometric Pressure & Temp Sensor',
    category: 'Pressure',
    description: 'Absolute barometric pressure sensor designed specifically for mobile applications, altimeters, and weather monitoring.',
    aliases: ['BMP280', 'Bosch BMP280', 'Altimeter Sensor'],
    specs: {
      voltage: '1.8V - 3.6V DC (3.3V recommended)',
      interface: 'I2C (Address 0x76/0x77) or SPI',
      range: '300 - 1100 hPa pressure (-500m to +9000m altitude)',
      accuracy: '±0.12 hPa (equivalent to ±1m altitude precision)',
      powerConsumption: '2.7uA at 1Hz sample rate',
    },
    pinout: [
      { pin: 'VCC', function: 'Power Supply', note: '3.3V max (use logic shifter on 5V Arduinos)' },
      { pin: 'GND', function: 'Ground', note: 'Ground reference' },
      { pin: 'SCL', function: 'I2C Clock / SPI SCK', note: 'I2C SCL line' },
      { pin: 'SDA', function: 'I2C Data / SPI SDI', note: 'I2C SDA line' },
      { pin: 'CSB', function: 'Chip Select', note: 'High for I2C, Low for SPI' },
      { pin: 'SDO', function: 'I2C Address Select / SPI SDO', note: 'GND=0x76, VCC=0x77' }
    ],
    sampleCode: {
      arduino: `#include <Wire.h>
#include <Adafruit_BMP280.h>
Adafruit_BMP280 bmp; // I2C

void setup() {
  Serial.begin(9600);
  if (!bmp.begin(0x76)) {
    Serial.println("BMP280 initialization failed!");
    while(1);
  }
}

void loop() {
  Serial.print("Temp: "); Serial.print(bmp.readTemperature()); Serial.print(" °C | ");
  Serial.print("Pressure: "); Serial.print(bmp.readPressure() / 100.0F); Serial.println(" hPa");
  delay(1000);
}`
    },
    calibrationGuide: 'Calibrated during manufacturing. Calculate relative sea-level pressure by configuring local reference elevation.',
    industrialUse: 'Drones / UAV altimeters, weather forecasting stations, indoor floor detection navigation.',
    commonMistakes: [
      'Applying 5V directly to VCC without onboard regulator (destroys sensor)',
      'Wrong I2C address (0x76 vs 0x77)'
    ]
  },
  {
    slug: 'hc-sr04',
    name: 'HC-SR04 Ultrasonic Distance Sensor',
    category: 'Proximity',
    description: 'Non-contact ultrasonic range measurement sensor utilizing 40kHz sonic bursts to detect targets from 2cm to 400cm.',
    aliases: ['HCSR04', 'Ultrasonic Sensor', 'Distance Sensor'],
    specs: {
      voltage: '5V DC',
      interface: 'Trigger pulse input (10us), Echo pulse output',
      range: '2cm - 400cm (Accuracy ±3mm)',
      accuracy: '±3mm precision, 15 degree measurement angle',
      powerConsumption: '15mA active',
    },
    pinout: [
      { pin: 'VCC', function: '5V Power', note: 'Requires 5V' },
      { pin: 'Trig', function: 'Trigger Input', note: 'Send 10us HIGH pulse' },
      { pin: 'Echo', function: 'Echo Output', note: 'Pulse width corresponds to round-trip time' },
      { pin: 'GND', function: 'Ground', note: 'Common ground' }
    ],
    sampleCode: {
      arduino: `const int trigPin = 9;
const int echoPin = 10;

void setup() {
  Serial.begin(9600);
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
}

void loop() {
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);

  long duration = pulseIn(echoPin, HIGH);
  float distanceCm = duration * 0.0343 / 2.0;

  Serial.print("Distance: "); Serial.print(distanceCm); Serial.println(" cm");
  delay(500);
}`
    },
    calibrationGuide: 'Distance (cm) = (Duration (us) * 0.0343) / 2. Temperature compensation formula: speed of sound = 331.3 + (0.606 * Temp°C) m/s.',
    industrialUse: 'Tank liquid level measurement, obstacle avoidance AGVs, parking sensor systems.',
    commonMistakes: [
      'Attaching Echo pin directly to 3.3V microcontrollers (ESP32/Pi) without voltage divider',
      'Measuring soft or sound-absorbing surfaces (fabric, foam)'
    ]
  },
  {
    slug: 'mpu6050',
    name: 'MPU-6050 6-DOF Gyroscope & Accelerometer',
    category: 'Motion',
    description: 'Motion tracking device combining a 3-axis gyroscope, 3-axis accelerometer, and Digital Motion Processor (DMP).',
    aliases: ['MPU6050', 'GY-521', '6-DOF IMU'],
    specs: {
      voltage: '3.0V - 5.0V (GY-521 breakout includes 3.3V LDO)',
      interface: 'I2C (0x68 default, 0x69 if AD0 high)',
      range: 'Gyro: ±250, 500, 1000, 2000 °/s | Accel: ±2g, ±4g, ±8g, ±16g',
      accuracy: '16-bit ADC per channel',
      powerConsumption: '3.9mA full active',
    },
    pinout: [
      { pin: 'VCC', function: 'Power', note: '3.3V or 5V on GY-521' },
      { pin: 'GND', function: 'Ground', note: 'Common ground' },
      { pin: 'SCL', function: 'I2C Clock', note: 'I2C SCL' },
      { pin: 'SDA', function: 'I2C Data', note: 'I2C SDA' },
      { pin: 'XDA', function: 'Auxiliary I2C Data', note: 'Connect external magnetometer' },
      { pin: 'XCL', function: 'Auxiliary I2C Clock', note: 'Connect external magnetometer' },
      { pin: 'AD0', function: 'I2C Address Bit', note: 'GND = 0x68, VCC = 0x69' },
      { pin: 'INT', function: 'Interrupt Output', note: 'Fires on data ready / motion motion' }
    ],
    sampleCode: {
      arduino: `#include <Adafruit_MPU6050.h>
#include <Adafruit_Sensor.h>
#include <Wire.h>

Adafruit_MPU6050 mpu;

void setup() {
  Serial.begin(9600);
  if (!mpu.begin()) {
    Serial.println("Failed to find MPU6050 chip");
    while (1);
  }
}

void loop() {
  sensors_event_t a, g, temp;
  mpu.getEvent(&a, &g, &temp);
  Serial.print("Accel X: "); Serial.print(a.acceleration.x);
  Serial.print(" Y: "); Serial.print(a.acceleration.y);
  Serial.print(" Z: "); Serial.println(a.acceleration.z);
  delay(500);
}`
    },
    calibrationGuide: 'Perform gyro offset calibration while resting stationary on a level flat surface. Complementary or Kalman filtering is recommended to combine gyro and accel data.',
    industrialUse: 'Vibration monitoring on industrial motors, drone orientation stabilization, rollover detection in heavy machinery.',
    commonMistakes: [
      'Relying solely on accelerometer under dynamic vibration without gyro sensor fusion',
      'Neglecting zero-rate offset calibration'
    ]
  }
];

export const PROTOCOLS_DATA = [
  {
    slug: 'mqtt',
    name: 'MQTT (Message Queuing Telemetry Transport)',
    category: 'Wireless',
    layer: 'Application',
    summary: 'Lightweight publish/subscribe network protocol designed for resource-constrained IoT devices and low-bandwidth, high-latency networks.',
    mermaidDiagram: `flowchart TD
    Sensor1[Temperature Sensor Node] -->|Publish: sensors/temp| Broker((MQTT Broker))
    Sensor2[Humidity Sensor Node] -->|Publish: sensors/humidity| Broker
    Broker -->|Subscribe: sensors/#| Dashboard[Web Dashboard / SCADA]
    Broker -->|Subscribe: sensors/temp| DB[(InfluxDB TimeSeries)]`,
    specs: {
      range: 'Global (Internet-wide over IP)',
      power: 'Very Low (Ideal for battery microcontrollers)',
      dataRate: 'Variable (Byte payloads up to 256MB max spec)',
      topology: 'Star / Broker-centric Publish-Subscribe',
      latency: 'Low (10ms - 100ms typical)',
      cost: 'Low (Open OASIS Standard)'
    },
    pros: [
      'Extremely small packet overhead (2-byte header minimum)',
      'QoS levels (0: At most once, 1: At least once, 2: Exactly once)',
      'Retained messages and Last Will and Testament (LWT) for client disconnection sensing'
    ],
    cons: [
      'Requires central broker as single point of failure without clustering',
      'Runs over TCP, requiring TCP connection keep-alive overhead',
      'No native payload format enforcement (JSON, Protobuf, or raw binary must be handled by application)'
    ],
    realWorldUseCases: [
      'Telemetry streaming from remote oil pipeline sensors',
      'Home Assistant and smart building automation hubs',
      'Fleet GPS vehicle tracking'
    ]
  },
  {
    slug: 'modbus',
    name: 'Modbus RTU / Modbus TCP',
    category: 'Industrial',
    layer: 'Application',
    summary: 'De facto industrial serial communication protocol used to connect industrial electronic devices to PLCs and SCADA.',
    mermaidDiagram: `flowchart LR
    Master[PLC / SCADA Master] -->|RS-485 / Modbus RTU| Slave1[Temperature Controller - Addr 1]
    Master -->|RS-485 / Modbus RTU| Slave2[Flow Meter - Addr 2]
    Master -->|RS-485 / Modbus RTU| Slave3[Variable Frequency Drive - Addr 3]`,
    specs: {
      range: '1200m over RS-485 differential pair',
      power: 'Medium (Mains powered industrial devices)',
      dataRate: '9600 to 115200 baud (RTU), 100 Mbps (TCP)',
      topology: 'Master - Slave (RTU), Client - Server (TCP)',
      latency: 'Deterministic (Polling rate dependent)',
      cost: 'Very Low (Open domain royalty free since 1979)'
    },
    pros: [
      'Simplicity: easy register-based memory architecture (Coils, Holding Registers)',
      'Ubiquitous support across virtually every industrial sensor and PLC worldwide',
      'Extremely reliable over long industrial factory floor distances via RS-485'
    ],
    cons: [
      'Single Master polling architecture; Slaves cannot report unsolicited alarms',
      'No native data typing (everything is raw 16-bit integer words)',
      'Zero security authentication or encryption'
    ],
    realWorldUseCases: [
      'Power meter readings in electrical distribution sub-panels',
      'PLC control of Variable Frequency Drives (VFDs)',
      'HVAC chiller plant management'
    ]
  }
];

export const PROMPTS_DATA = [
  {
    category: 'Troubleshooting',
    title: 'Sensor Giving NaN / Zero Readings',
    preview: 'Diagnose why a digital sensor (DHT22, BMP280, I2C) is returning invalid or zero values.',
    content: 'My DHT22 temperature sensor connected to an ESP32 on GPIO 4 is returning NaN values constantly. The wiring uses a 10k resistor. Help me troubleshoot step-by-step.',
    targetFeature: '/troubleshoot'
  },
  {
    category: 'Code',
    title: 'Non-blocking millis() Timer in Arduino',
    preview: 'Replace delay() with millis() for multi-tasking sensor sampling and LED blinking.',
    content: 'Write an Arduino C++ sketch that reads an analog sensor every 500ms and blinks an LED every 1000ms simultaneously without using the delay() function.',
    targetFeature: '/code'
  }
];
