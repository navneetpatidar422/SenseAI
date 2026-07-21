import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { streamAIResponse } from '../services/aiService.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/projects/generate', async (req, res) => {
  try {
    const { idea, requirements = [], budget = 3000, currency = 'INR', sensors = [], microcontroller = 'ESP32' } = req.body;

    if (!idea) {
      return res.status(400).json({ error: { message: 'Project idea description is required' } });
    }

    const prompt = `Project Idea: ${idea}
Requirements: ${requirements.join(', ') || 'Standard IIoT monitoring'}
Budget Constraint: ${currency} ${budget}
Sensors Selected: ${sensors.join(', ') || 'Recommend ideal sensors'}
Target Microcontroller: ${microcontroller}

Please generate a complete 7-section project plan:
1. System Architecture (with Mermaid diagram)
2. Component List & Itemized Price Table
3. Connection & Wiring Flow
4. Development Roadmap
5. Estimated Total Cost
6. Challenges & Mitigations
7. Future Improvements`;

    await streamAIResponse('project', prompt, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Project generation failed' } });
    }
  }
});

router.get('/projects', async (req, res) => {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { createdAt: 'desc' },
    });
    const parsed = projects.map((p) => ({
      ...p,
      components: JSON.parse(p.components || '[]'),
      connectionFlow: JSON.parse(p.connectionFlow || '[]'),
      roadmap: JSON.parse(p.roadmap || '[]'),
      challenges: JSON.parse(p.challenges || '[]'),
      futureImprovements: JSON.parse(p.futureImprovements || '[]'),
    }));
    res.json(parsed);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch projects' } });
  }
});

router.post('/projects', async (req, res) => {
  try {
    const {
      title,
      idea,
      budget,
      currency = 'INR',
      microcontroller,
      architectureDiagram = '',
      components = [],
      connectionFlow = [],
      roadmap = [],
      estimatedTotalCost = 0,
      challenges = [],
      futureImprovements = [],
    } = req.body;

    const project = await prisma.project.create({
      data: {
        title: title || idea.substring(0, 30),
        idea,
        budget: Number(budget) || 3000,
        currency,
        microcontroller: microcontroller || 'ESP32',
        architectureDiagram,
        components: JSON.stringify(components),
        connectionFlow: JSON.stringify(connectionFlow),
        roadmap: JSON.stringify(roadmap),
        estimatedTotalCost: Number(estimatedTotalCost) || 0,
        challenges: JSON.stringify(challenges),
        futureImprovements: JSON.stringify(futureImprovements),
      },
    });

    res.json(project);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to save project' } });
  }
});

router.delete('/projects/:id', async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: req.params.id } });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to delete project' } });
  }
});

export default router;
