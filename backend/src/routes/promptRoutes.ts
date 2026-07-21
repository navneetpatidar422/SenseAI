import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/prompts', async (req, res) => {
  try {
    const { category, q } = req.query;
    const whereClause: any = {};

    if (category && typeof category === 'string' && category !== 'All') {
      whereClause.category = category;
    }
    if (q && typeof q === 'string') {
      whereClause.OR = [
        { title: { contains: q } },
        { preview: { contains: q } },
        { content: { contains: q } },
      ];
    }

    const prompts = await prisma.prompt.findMany({
      where: whereClause,
      orderBy: { title: 'asc' },
    });

    res.json(prompts);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch prompts' } });
  }
});

router.post('/prompts/:id/favorite', async (req, res) => {
  try {
    const updated = await prisma.prompt.update({
      where: { id: req.params.id },
      data: { isFavorite: true },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to favorite prompt' } });
  }
});

router.delete('/prompts/:id/favorite', async (req, res) => {
  try {
    const updated = await prisma.prompt.update({
      where: { id: req.params.id },
      data: { isFavorite: false },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to unfavorite prompt' } });
  }
});

export default router;
