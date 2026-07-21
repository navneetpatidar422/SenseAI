import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { streamAIResponse } from '../services/aiService.js';

const router = Router();
const prisma = new PrismaClient();

router.post('/learning/lessons', async (req, res) => {
  try {
    const { topic = 'MQTT Protocol Basics', difficulty = 'Beginner' } = req.body;

    const prompt = `Topic: ${topic}
Difficulty Level: ${difficulty}

Generate a 5-step interactive lesson. Include real-world analogies, worked code examples, a mini comprehension quiz with multiple choice options and answer explanations, and a final practice task.`;

    await streamAIResponse('learning', prompt, res);
  } catch (err) {
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Failed to generate lesson' } });
    }
  }
});

router.get('/learning/progress', async (req, res) => {
  try {
    const progress = await prisma.learningProgress.findMany({
      orderBy: { updatedAt: 'desc' },
    });
    res.json(progress);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch learning progress' } });
  }
});

router.patch('/learning/progress/:topicId', async (req, res) => {
  try {
    const { currentStep, totalSteps = 5, completed, quizPassed, topicTitle = '' } = req.body;

    const updated = await prisma.learningProgress.upsert({
      where: { topicId: req.params.topicId },
      update: {
        ...(currentStep !== undefined && { currentStep }),
        ...(totalSteps !== undefined && { totalSteps }),
        ...(completed !== undefined && { completed }),
        ...(quizPassed !== undefined && { quizPassed }),
      },
      create: {
        topicId: req.params.topicId,
        topicTitle: topicTitle || req.params.topicId,
        currentStep: currentStep || 1,
        totalSteps: totalSteps || 5,
        completed: completed || false,
        quizPassed: quizPassed || false,
      },
    });

    if (completed) {
      const today = new Date().toISOString().split('T')[0];
      const stats = await prisma.userStats.findUnique({ where: { id: 'user_default' } });
      if (stats && stats.lastActiveDate !== today) {
        await prisma.userStats.update({
          where: { id: 'user_default' },
          data: {
            streakCount: stats.streakCount + 1,
            lastActiveDate: today,
          },
        });
      }
    }

    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to update progress' } });
  }
});

export default router;
