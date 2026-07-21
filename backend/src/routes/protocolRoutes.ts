import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { streamAIResponse } from '../services/aiService.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/protocols', async (req, res) => {
  try {
    const { type } = req.query;
    const whereClause: any = {};
    if (type && typeof type === 'string') {
      whereClause.category = type;
    }

    const protocols = await prisma.protocol.findMany({
      where: whereClause,
      orderBy: { name: 'asc' },
    });

    const parsed = protocols.map((p) => ({
      ...p,
      specs: JSON.parse(p.specs || '{}'),
      pros: JSON.parse(p.pros || '[]'),
      cons: JSON.parse(p.cons || '[]'),
      realWorldUseCases: JSON.parse(p.realWorldUseCases || '[]'),
    }));

    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch protocols' } });
  }
});

router.get('/protocols/:slug', async (req, res) => {
  try {
    const protocol = await prisma.protocol.findUnique({
      where: { slug: req.params.slug },
    });

    if (!protocol) {
      return res.status(404).json({ error: { message: 'Protocol not found' } });
    }

    res.json({
      ...protocol,
      specs: JSON.parse(protocol.specs || '{}'),
      pros: JSON.parse(protocol.pros || '[]'),
      cons: JSON.parse(protocol.cons || '[]'),
      realWorldUseCases: JSON.parse(protocol.realWorldUseCases || '[]'),
    });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch protocol' } });
  }
});

router.post('/protocols/compare', async (req, res) => {
  try {
    const { slugs = [] } = req.body;
    if (!Array.isArray(slugs) || slugs.length < 2) {
      return res.status(400).json({ error: { message: 'Select at least 2 protocols to compare' } });
    }

    const protocols = await prisma.protocol.findMany({
      where: { slug: { in: slugs } },
    });

    const names = protocols.map((p) => p.name).join(', ');
    const prompt = `Compare the following IoT/Industrial communication protocols side-by-side: ${names}. Structure the comparison with a Markdown comparison table first (Range, Power, Data Rate, Topology, Latency, Cost), followed by pros/cons and a Mermaid architecture diagram showing how they interact or contrast.`;

    await streamAIResponse('protocol', prompt, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Failed to compare protocols' } });
    }
  }
});

export default router;
