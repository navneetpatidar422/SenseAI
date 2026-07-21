import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { streamAIResponse } from '../services/aiService.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/sensors', async (req, res) => {
  try {
    const { category, q } = req.query;
    const whereClause: any = {};

    if (category && typeof category === 'string') {
      whereClause.category = category;
    }
    if (q && typeof q === 'string') {
      whereClause.OR = [
        { name: { contains: q } },
        { description: { contains: q } },
        { aliases: { contains: q } },
      ];
    }

    const sensors = await prisma.sensor.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    const parsedSensors = sensors.map((s) => ({
      ...s,
      aliases: JSON.parse(s.aliases || '[]'),
      specs: JSON.parse(s.specs || '{}'),
      pinout: JSON.parse(s.pinout || '[]'),
      sampleCode: JSON.parse(s.sampleCode || '{}'),
      commonMistakes: JSON.parse(s.commonMistakes || '[]'),
    }));

    res.json(parsedSensors);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch sensors' } });
  }
});

router.get('/sensors/:slug', async (req, res) => {
  try {
    const sensor = await prisma.sensor.findUnique({
      where: { slug: req.params.slug },
    });

    if (!sensor) {
      return res.status(404).json({ error: { message: 'Sensor not found' } });
    }

    res.json({
      ...sensor,
      aliases: JSON.parse(sensor.aliases || '[]'),
      specs: JSON.parse(sensor.specs || '{}'),
      pinout: JSON.parse(sensor.pinout || '[]'),
      sampleCode: JSON.parse(sensor.sampleCode || '{}'),
      commonMistakes: JSON.parse(sensor.commonMistakes || '[]'),
    });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch sensor details' } });
  }
});

router.post('/sensors/:slug/explain', async (req, res) => {
  try {
    const { tab = 'overview' } = req.body;
    const sensor = await prisma.sensor.findUnique({ where: { slug: req.params.slug } });
    const sensorName = sensor ? sensor.name : req.params.slug;

    const prompt = `Provide a detailed breakdown for the sensor "${sensorName}" focusing specifically on the "${tab}" aspect (e.g. Pinout, Working Principle, Specs, Code, Calibration, or Industrial Use).`;
    await streamAIResponse('sensor', prompt, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Failed to explain sensor' } });
    }
  }
});

export default router;
