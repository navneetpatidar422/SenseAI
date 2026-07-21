import { Router } from 'express';
import { streamAIResponse } from '../services/aiService.js';

const router = Router();

router.post('/components/recommend', async (req, res) => {
  try {
    const { categories = [], useCase, environment = 'Indoor', power = 'Battery', budget, precision = 'Standard' } = req.body;

    const prompt = `Use Case: ${useCase || 'General IIoT sensing'}
Categories Requested: ${categories.length > 0 ? categories.join(', ') : 'Sensors, MCU, Comm'}
Environment: ${environment}
Power Constraint: ${power}
Budget Tier: ${budget || 'Flexible'}
Precision Needed: ${precision}

Provide ranked component recommendations with pricing, rationale, and "Why this over X" tradeoffs vs alternative components.`;

    await streamAIResponse('componentRec', prompt, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Component recommendation failed' } });
    }
  }
});

export default router;
