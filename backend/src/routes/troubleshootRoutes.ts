import { Router } from 'express';
import { streamAIResponse } from '../services/aiService.js';

const router = Router();

router.post('/troubleshoot', async (req, res) => {
  try {
    const { symptoms, errorCodes = [], sensorValues = [], behavior, logs } = req.body;

    if (!symptoms) {
      return res.status(400).json({ error: { message: 'Symptoms description is required' } });
    }

    const structuredPrompt = `
Symptom Description: ${symptoms}
Machine Behavior: ${behavior || 'Not specified'}
Error Codes: ${errorCodes.length > 0 ? errorCodes.join(', ') : 'None provided'}
Sensor Values: ${sensorValues.map((s: any) => `${s.key || s.name}: ${s.value}`).join('; ') || 'None'}
Logs Snippet: ${logs || 'None'}
Please diagnose the issue, rank likely causes, provide safety warnings, fixes, and a checklist.`;

    await streamAIResponse('troubleshoot', structuredPrompt, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Troubleshooting stream failed' } });
    }
  }
});

export default router;
