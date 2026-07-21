import { Router } from 'express';
import { streamAIResponse } from '../services/aiService.js';

const router = Router();

router.post('/fault-diagnosis', async (req, res) => {
  try {
    const { equipmentType = 'Industrial Motor', parameters = [] } = req.body;

    const paramStr = parameters
      .map((p: any) => `${p.name || 'Param'}: ${p.value} ${p.unit || ''} (Normal: ${p.normal || 'N/A'})`)
      .join('\n');

    const prompt = `Equipment Type: ${equipmentType}
Sensor Measurements:
${paramStr || 'No specific parameters provided.'}

Analyze the sensor readings, calculate a 0-100 Health Score, list probable fault types with confidence probabilities, assign an overall Priority Level (Low/Medium/High/Critical), and detail immediate maintenance actions.`;

    await streamAIResponse('faultDiag', prompt, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Fault diagnosis failed' } });
    }
  }
});

export default router;
