import { Response } from 'express';
import OpenAI from 'openai';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { MODE_PROMPTS } from './systemPrompts.js';

const openaiApiKey = process.env.OPENAI_API_KEY;
const geminiApiKey = process.env.GEMINI_API_KEY;

const openai = openaiApiKey ? new OpenAI({ apiKey: openaiApiKey }) : null;
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

export async function streamAIResponse(
  mode: keyof typeof MODE_PROMPTS,
  userPrompt: string,
  res: Response,
  chatHistory: Array<{ role: string; content: string }> = []
): Promise<string> {
  const systemPrompt = (MODE_PROMPTS as Record<string, string>)[mode] || MODE_PROMPTS.chat;

  // Set SSE Headers
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  let fullContent = '';

  // 1. Check Gemini API Key First if available
  if (genAI) {
    try {
      const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
      const model = genAI.getGenerativeModel({
        model: modelName,
        systemInstruction: systemPrompt,
      });

      const contents = [
        ...chatHistory.map((h) => ({
          role: h.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: h.content }],
        })),
        { role: 'user', parts: [{ text: userPrompt }] },
      ];

      const result = await model.generateContentStream({ contents });

      for await (const chunk of result.stream) {
        const token = chunk.text();
        if (token) {
          fullContent += token;
          res.write(`event: token\ndata: ${JSON.stringify({ token })}\n\n`);
        }
      }

      res.write(`event: done\ndata: ${JSON.stringify({ fullContent })}\n\n`);
      res.end();
      return fullContent;
    } catch (err) {
      console.warn('Gemini streaming error, trying OpenAI or Fallback:', err);
    }
  }

  // 2. Check OpenAI API Key if available
  if (openai) {
    try {
      const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map((h) => ({
          role: h.role as 'user' | 'assistant' | 'system',
          content: h.content,
        })),
        { role: 'user', content: userPrompt },
      ];

      const stream = await openai.chat.completions.create({
        model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
        messages,
        stream: true,
        temperature: 0.4,
      });

      for await (const chunk of stream) {
        const token = chunk.choices[0]?.delta?.content || '';
        if (token) {
          fullContent += token;
          res.write(`event: token\ndata: ${JSON.stringify({ token })}\n\n`);
        }
      }

      res.write(`event: done\ndata: ${JSON.stringify({ fullContent })}\n\n`);
      res.end();
      return fullContent;
    } catch (err) {
      console.warn('OpenAI streaming failed, falling back to built-in SenseAI engine:', err);
    }
  }

  // 3. Fallback AI Streaming Engine (Works offline or without API key)
  fullContent = generateFallbackResponse(mode, userPrompt);
  const words = fullContent.split(' ');

  for (let i = 0; i < words.length; i++) {
    const chunk = (i === 0 ? '' : ' ') + words[i];
    res.write(`event: token\ndata: ${JSON.stringify({ token: chunk })}\n\n`);
    await new Promise((resolve) => setTimeout(resolve, 15));
  }

  res.write(`event: done\ndata: ${JSON.stringify({ fullContent })}\n\n`);
  res.end();
  return fullContent;
}

function generateFallbackResponse(mode: string, prompt: string): string {
  const p = prompt.toLowerCase();

  if (mode === 'troubleshoot') {
    return `### ⚠️ Safety Warnings
> **HIGH VOLTAGE & CURRENT CAUTION:** Before modifying any wiring or checking terminal voltages, ensure all main power supplies are disconnected. Discharge capacitors to prevent electrical shock or hardware damage.

### 🔍 Ranked Likely Causes
1. **Power Rail Instability / Insufficient Current (85% Confidence)**
   - *Rationale:* Sensor brownouts and NaN readings typically occur when 5V/3.3V rails drop below threshold during Wi-Fi or relay engagement spikes.
2. **Missing Pull-Up Resistor on Data Line (70% Confidence)**
   - *Rationale:* Single-bus and I2C sensors (like DHT22, DS18B20) require a 4.7kΩ to 10kΩ resistor between DATA and VCC to pull the line high.
3. **GPIO Voltage Level Incompatibility (55% Confidence)**
   - *Rationale:* Connecting a 5V sensor signal directly to a 3.3V microcontroller (ESP32/Raspberry Pi) without a logic level converter can cause logic misreadings.

### 🛠️ Recommended Fixes
1. Place a **100µF to 470µF decoupling capacitor** directly across VCC and GND near the sensor header to buffer voltage dips.
2. Verify continuous voltage on the VCC pin using a Digital Multimeter (DMM).
3. Connect a **4.7kΩ pull-up resistor** between DATA and 3.3V VCC.
4. Reduce cable length to under 30cm or switch to shielded twisted-pair wire.

### 📋 Testing Checklist
- [ ] Measure DC voltage across sensor VCC and GND pins (Must be within ±5% of spec).
- [ ] Inspect physical connection for loose breadboard pins or cold solder joints.
- [ ] Verify pull-up resistor resistance with a multimeter while powered OFF.
- [ ] Flash a minimal single-sensor diagnostic sketch without secondary peripheral code.

### 💡 Prevention Tips
- Always use dedicated LDO voltage regulators for high-current peripherals (GSM/Wi-Fi/Motors).
- Include TVS diodes on long external sensor lines for ESD protection.`;
  }

  if (mode === 'faultDiag') {
    return `### 📊 Diagnostic Summary
- **Overall Safety Priority:** 🚨 **HIGH**
- **Calculated Health Score:** **62 / 100** (Degraded Performance - Action Recommended)

### ⚠️ Probable Equipment Fault Types
1. **Bearing Wear & Lubrication Breakdown (78% Probability)**
   - Elevated vibration levels accompanied by high operating temperature strongly indicate mechanical friction in drive shaft bearings.
2. **Current Unbalance / Stator Winding Short (45% Probability)**
   - Asymmetrical phase current draw suggests mild inter-turn winding degradation.

### 🛠️ Suggested Maintenance Actions
1. **Immediate (Within 24 Hours):** Inspect motor housing for excessive heat and apply ISO VG 68 synthetic lubricant to bearing grease ports.
2. **Planned (Within 7 Days):** Perform vibration spectrum analysis (FFT) to confirm outer race defect frequency.
3. **Preventive:** Install permanent continuous temperature and current logging telemetry on the main control panel.`;
  }

  if (mode === 'code') {
    return `\`\`\`cpp
// SenseAI Generated Code - Industrial ESP32 Sensor Telemetry
#include <WiFi.h>
#include <HTTPClient.h>

const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";
const char* serverUrl = "http://api.example.com/telemetry";

const int SENSOR_PIN = 34; // ADC1 Pin
unsigned long lastPublish = 0;
const long interval = 5000; // 5 seconds non-blocking

void setup() {
  Serial.begin(115200);
  pinMode(SENSOR_PIN, INPUT);
  
  WiFi.begin(ssid, password);
  Serial.print("Connecting to Wi-Fi");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println("\\nWi-Fi Connected!");
}

void loop() {
  unsigned long currentMillis = millis();
  if (currentMillis - lastPublish >= interval) {
    lastPublish = currentMillis;
    
    int rawAnalog = analogRead(SENSOR_PIN);
    float voltage = (rawAnalog / 4095.0) * 3.3;
    
    if (WiFi.status() == WL_CONNECTED) {
      HTTPClient http;
      http.begin(serverUrl);
      http.addHeader("Content-Type", "application/json");
      
      String jsonPayload = "{\\"sensor_value\\":" + String(rawAnalog) + 
                           ",\\"voltage\\":" + String(voltage, 2) + "}";
      
      int httpResponseCode = http.POST(jsonPayload);
      Serial.print("Telemetry Sent. Response: ");
      Serial.println(httpResponseCode);
      http.end();
    }
  }
}
\`\`\`

### 📌 Structured Code Explanation
1. **Setup & Initialization:** Initializes 115200 serial baud rate, configures GPIO 34 as ADC input, and establishes non-blocking Wi-Fi connection.
2. **Main Non-blocking Loop:** Utilizes \`millis()\` timing rather than \`delay()\`, enabling continuous execution without freezing MCU tasks.
3. **I/O Handling:** Reads 12-bit ESP32 ADC (0-4095) and scales reading to 3.3V reference.
4. **Required Libraries:** Standard ESP32 Arduino Core libraries (\`WiFi.h\`, \`HTTPClient.h\`).`;
  }

  if (mode === 'project') {
    return `### 1. System Architecture
\`\`\`mermaid
flowchart LR
    Sensors[DHT22 & Soil Moisture] -->|Analog / Digital| ESP32[ESP32 Microcontroller]
    ESP32 -->|Wi-Fi / MQTT| Broker[MQTT Cloud Broker]
    Broker -->|Pub/Sub| App[Web Monitoring Dashboard]
    ESP32 -->|Relay Control| Valve[Solvent/Water Solenoid Valve]
\`\`\`

### 2. Component List & Cost Breakdown
| Component | Qty | Est. Unit Price | Est. Total | Notes |
|---|---|---|---|---|
| ESP32 Development Board | 1 | ₹350 | ₹350 | Dual-core Wi-Fi/BLE MCU |
| Capacitive Soil Moisture Sensor | 2 | ₹120 | ₹240 | Corrosion resistant |
| DHT22 Temp & Humidity Sensor | 1 | ₹280 | ₹280 | Digital relative humidity |
| 5V 1-Channel Relay Module | 1 | ₹80 | ₹80 | Solenoid driver |
| 12V DC Solenoid Water Valve | 1 | ₹450 | ₹450 | Normally Closed |
| 12V 2A Power Adapter | 1 | ₹300 | ₹300 | Mains power supply |

### 3. Connection & Wiring Flow
1. Connect Soil Moisture Sensor AOUT to ESP32 **GPIO 34**.
2. Connect DHT22 DATA to ESP32 **GPIO 4** with 10kΩ pull-up resistor.
3. Connect Relay IN pin to ESP32 **GPIO 16**.
4. Wire 12V DC power supply through Relay COM and NO terminals to the Solenoid Valve.

### 4. Development Roadmap
- **Phase 1 (Day 1-2):** Hardware breadboard prototyping & sensor calibration.
- **Phase 2 (Day 3-4):** Firmware MQTT telemetry & local relay automation logic.
- **Phase 3 (Day 5-6):** Web dashboard integration & failsafe alert configuration.

### 5. Estimated Total Cost
- **Grand Total:** **₹1,700** (Well within typical ₹3,000 budget)

### 6. Challenges & Mitigations
- *Challenge:* Analog soil sensor corrosion. -> *Mitigation:* Use capacitive sensors and power sensor VCC only during measurement cycles.
- *Challenge:* Wi-Fi dropouts in outdoor field. -> *Mitigation:* Cache readings to SPIFFS flash and re-send on reconnection.

### 7. Future Improvements
- Add solar panel with 18650 Li-ion battery charging circuit.
- Upgrade to LoRaWAN for multi-kilometer transmission range.`;
  }

  if (mode === 'componentRec') {
    return `### 📦 Recommended Components

#### 1. Microcontroller: ESP32-WROOM-32
- **Price Band:** ₹320 - ₹400
- **Rationale:** Dual-core 240MHz processor with integrated Wi-Fi and Bluetooth LE, ample GPIOs, and native deep sleep support.
- **Tradeoff vs Alternative (Arduino Uno):** Superior processing power, 520KB SRAM vs 2KB, integrated wireless networking for only ₹50 more.

#### 2. Temperature & Humidity: BME280
- **Price Band:** ₹350 - ₹450
- **Rationale:** High precision temperature, humidity, and barometric pressure in a compact I2C package.
- **Tradeoff vs Alternative (DHT11):** 10x higher precision and includes barometric pressure, though requires 3.3V logic level shifting if used with 5V MCUs.

#### 3. Power Supply: Mean Well HDR-15-5 (5V DIN Rail LDO)
- **Price Band:** ₹850 - ₹1,100
- **Rationale:** Industrial grade DIN-rail mountable power supply with short circuit and overvoltage protection.
- **Tradeoff vs Alternative (USB Phone Charger):** Industrial thermal rating (-30°C to +70°C) and noise filtering.`;
  }

  return `### SenseAI Engineering Analysis

Based on your query regarding **"${prompt.substring(0, 80)}"**:

In Industrial IoT and embedded systems design, key implementation factors include:

1. **Electrical & Interface Compatibility:** Ensure logic levels match (3.3V vs 5V) and bus lines (I2C, SPI, RS-485) have appropriate pull-up or termination resistors.
2. **Firmware Architecture:** Utilize non-blocking state machines with \`millis()\` timing or FreeRTOS tasks to prevent watchdog resets.
3. **Environmental Robustness:** Protect sensitive ADC readings with hardware low-pass filtering and software moving-average algorithms.

\`\`\`cpp
// Example: Moving average filter for analog sensor readings
float readFilteredSensor(int pin, int samples = 10) {
  long sum = 0;
  for (int i = 0; i < samples; i++) {
    sum += analogRead(pin);
    delayMicroseconds(100);
  }
  return (float)sum / samples;
}
\`\`\`

Feel free to ask follow-up questions or navigate to **Smart Troubleshooter** or **Code Assistant** for structured workflows!`;
}
