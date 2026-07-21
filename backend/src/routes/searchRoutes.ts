import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/search', async (req, res) => {
  try {
    const q = (req.query.q as string || '').trim().toLowerCase();
    if (!q) {
      return res.json({ results: [] });
    }

    const [sensors, protocols, projects, prompts, chats] = await Promise.all([
      prisma.sensor.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { description: { contains: q } },
            { category: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.protocol.findMany({
        where: {
          OR: [
            { name: { contains: q } },
            { summary: { contains: q } },
            { category: { contains: q } },
          ],
        },
        take: 5,
      }),
      prisma.project.findMany({
        where: {
          OR: [{ title: { contains: q } }, { idea: { contains: q } }],
        },
        take: 5,
      }),
      prisma.prompt.findMany({
        where: {
          OR: [{ title: { contains: q } }, { preview: { contains: q } }],
        },
        take: 5,
      }),
      prisma.chat.findMany({
        where: {
          title: { contains: q },
        },
        take: 5,
      }),
    ]);

    const results = [
      ...sensors.map((s) => ({
        category: 'Sensors',
        id: s.id,
        title: s.name,
        subtitle: `${s.category} Sensor - ${s.description.substring(0, 60)}...`,
        route: `/sensors?sensor=${s.slug}`,
      })),
      ...protocols.map((p) => ({
        category: 'Protocols',
        id: p.id,
        title: p.name,
        subtitle: `${p.category} ${p.layer} Layer Protocol`,
        route: `/protocols?protocol=${p.slug}`,
      })),
      ...projects.map((pr) => ({
        category: 'Projects',
        id: pr.id,
        title: pr.title,
        subtitle: `Microcontroller: ${pr.microcontroller} | Est: ${pr.currency} ${pr.estimatedTotalCost}`,
        route: `/projects?project=${pr.id}`,
      })),
      ...prompts.map((p) => ({
        category: 'Prompts',
        id: p.id,
        title: p.title,
        subtitle: p.preview,
        route: p.targetFeature,
      })),
      ...chats.map((c) => ({
        category: 'Chats',
        id: c.id,
        title: c.title,
        subtitle: `Saved Conversation (${new Date(c.updatedAt).toLocaleDateString()})`,
        route: `/chat?chatId=${c.id}`,
      })),
    ];

    res.json({ results });
  } catch (err) {
    res.status(500).json({ error: { message: 'Search failed' } });
  }
});

export default router;
