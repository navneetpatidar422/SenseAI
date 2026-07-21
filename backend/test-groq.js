import dotenv from 'dotenv';
import Groq from 'groq-sdk';

dotenv.config();

const apiKey = process.env.GROQ_API_KEY;
console.log('Detected GROQ_API_KEY:', apiKey ? `${apiKey.substring(0, 7)}...` : 'NONE');

if (!apiKey) {
  console.log('⚠️ No GROQ_API_KEY set in backend/.env');
  process.exit(0);
}

async function testGroq() {
  try {
    const groq = new Groq({ apiKey });
    const model = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
    console.log(`Testing Groq model "${model}"...`);

    const res = await groq.chat.completions.create({
      messages: [{ role: 'user', content: 'Say "Groq API Connection Successful!"' }],
      model,
    });

    console.log('🎉 SUCCESS:', res.choices[0]?.message?.content);
  } catch (err) {
    console.error('❌ Groq Error:', err?.message || err);
  }
}

testGroq();
