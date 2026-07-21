import { Response } from 'express';
import OpenAI from 'openai';
import Groq from 'groq-sdk';
import { MODE_PROMPTS } from './systemPrompts.js';

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
  let lastErrorMessage = '';

  const groqApiKey = process.env.GROQ_API_KEY?.trim();
  const openaiApiKey = process.env.OPENAI_API_KEY?.trim();

  // 1. Try Groq API if GROQ_API_KEY is present
  if (groqApiKey && groqApiKey !== 'YOUR_GROQ_API_KEY_HERE') {
    try {
      console.log('⚡ Invoking Groq API...');
      const groq = new Groq({ apiKey: groqApiKey });
      const modelName = process.env.GROQ_MODEL?.trim() || 'llama-3.3-70b-versatile';

      const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map((h) => ({
          role: (h.role === 'assistant' ? 'assistant' : 'user') as 'user' | 'assistant',
          content: h.content,
        })),
        { role: 'user', content: userPrompt },
      ];

      const stream = await groq.chat.completions.create({
        messages,
        model: modelName,
        stream: true,
        temperature: 0.3,
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
    } catch (err: any) {
      console.error('❌ Groq API Streaming Error:', err?.message || err);
      lastErrorMessage = `Groq Error: ${err?.message || String(err)}`;
    }
  }

  // 2. Try OpenAI API if OPENAI_API_KEY is present
  if (openaiApiKey && openaiApiKey !== 'YOUR_OPENAI_API_KEY_HERE') {
    try {
      console.log('🤖 Invoking OpenAI API...');
      const openai = new OpenAI({ apiKey: openaiApiKey });
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
    } catch (err: any) {
      console.error('❌ OpenAI API Streaming Error:', err?.message || err);
      lastErrorMessage = `OpenAI Error: ${err?.message || String(err)}`;
    }
  }

  // 3. Construct explicit error or missing key banner
  if (!groqApiKey && !openaiApiKey) {
    fullContent = `> ⚠️ **Groq API Key Missing**: No \`GROQ_API_KEY\` detected in \`backend/.env\`.
> 
> To enable ultra-fast live AI responses:
> 1. Get your free API key at [console.groq.com](https://console.groq.com/).
> 2. Open \`backend/.env\` and set \`GROQ_API_KEY=gsk_your_key_here\`.
> 3. Restart the backend server (\`npm run dev\`).

---

` + generateFallbackResponse(mode, userPrompt);
  } else {
    fullContent = `> 🚨 **Groq API Request Error**: ${lastErrorMessage || 'Failed to connect to Groq API.'}
> 
> *Troubleshooting Tip:* Check key validity and model name (\`llama-3.3-70b-versatile\`) in \`backend/.env\`.

---

` + generateFallbackResponse(mode, userPrompt);
  }

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

### 🛠️ Recommended Fixes
1. Place a **100µF to 470µF decoupling capacitor** directly across VCC and GND near the sensor header to buffer voltage dips.
2. Verify continuous voltage on the VCC pin using a Digital Multimeter (DMM).
3. Connect a **4.7kΩ pull-up resistor** between DATA and 3.3V VCC.`;
  }

  return `### SenseAI Engineering Analysis

Based on your query regarding **"${prompt.substring(0, 80)}"**:

In Industrial IoT and embedded systems design, key implementation factors include:

1. **Electrical & Interface Compatibility:** Ensure logic levels match (3.3V vs 5V) and bus lines (I2C, SPI, RS-485) have appropriate pull-up or termination resistors.
2. **Firmware Architecture:** Utilize non-blocking state machines with \`millis()\` timing or FreeRTOS tasks to prevent watchdog resets.
3. **Environmental Robustness:** Protect sensitive ADC readings with hardware low-pass filtering and software moving-average algorithms.`;
}
