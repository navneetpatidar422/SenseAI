import { Router } from 'express';
import { streamAIResponse } from '../services/aiService.js';

const router = Router();

router.post('/code/generate', async (req, res) => {
  try {
    const { platform = 'ESP32', language = 'C++', prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: { message: 'Prompt description is required' } });
    }

    const fullPrompt = `Target Platform: ${platform}
Target Language: ${language}
Requirement: ${prompt}

Please generate complete, production-ready, compilable code with inline hardware comments, followed by a 4-part structured explanation (Setup, Main Loop, I/O Handling, Required Libraries).`;

    await streamAIResponse('code', fullPrompt, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Code generation failed' } });
    }
  }
});

router.post('/code/explain', async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ error: { message: 'Code snippet is required' } });
    }

    const prompt = `Explain the following hardware code line-by-line, highlighting memory usage, peripheral register initialization, and potential hardware bugs:
\`\`\`
${code}
\`\`\``;

    await streamAIResponse('code', prompt, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Code explanation failed' } });
    }
  }
});

export default router;
