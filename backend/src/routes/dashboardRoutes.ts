import { Router } from 'express';
import { PrismaClient } from '@prisma/client';

const router = Router();
const prisma = new PrismaClient();

router.get('/dashboard', async (req, res) => {
  try {
    const [pinnedChats, recentChats, popularSensors, userStats, projects] = await Promise.all([
      prisma.chat.findMany({
        where: { pinned: true },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.chat.findMany({
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.sensor.findMany({
        take: 4,
        orderBy: { name: 'asc' },
      }),
      prisma.userStats.findUnique({
        where: { id: 'user_default' },
      }),
      prisma.project.findMany({
        take: 3,
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    const recentActivity = [
      ...recentChats.map((c) => ({
        id: c.id,
        type: 'chat' as const,
        title: c.title,
        timestamp: c.updatedAt.toISOString(),
        route: `/chat?chatId=${c.id}`,
      })),
      ...projects.map((p) => ({
        id: p.id,
        type: 'project' as const,
        title: p.title,
        timestamp: p.createdAt.toISOString(),
        route: `/projects?project=${p.id}`,
      })),
    ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

    const parsedPopularSensors = popularSensors.map((s) => ({
      ...s,
      aliases: JSON.parse(s.aliases || '[]'),
      specs: JSON.parse(s.specs || '{}'),
      pinout: JSON.parse(s.pinout || '[]'),
      sampleCode: JSON.parse(s.sampleCode || '{}'),
      commonMistakes: JSON.parse(s.commonMistakes || '[]'),
    }));

    const trendingTopics = [
      {
        title: 'ESP32 Wi-Fi Low-Power Duty Cycling',
        category: 'Embedded Firmware',
        summary: 'Optimizing sleep modes and power rails for 5-year battery life.',
        route: '/learning',
      },
      {
        title: 'Modbus RTU vs OPC-UA in Modern Factories',
        category: 'Industrial Automation',
        summary: 'Bridging legacy RS-485 serial sensors with Industry 4.0 cloud backends.',
        route: '/protocols?protocol=modbus',
      },
      {
        title: 'LoRaWAN Payload Compression Techniques',
        category: 'Wireless Networks',
        summary: 'Packing float values into compact binary bitfields.',
        route: '/protocols?protocol=lorawan',
      },
    ];

    const heatStrip = Array.from({ length: 14 }).map((_, i) => i > 4 && i < 12);

    res.json({
      recentActivity,
      pinnedChats,
      streak: {
        count: userStats?.streakCount || 5,
        lastActiveDate: userStats?.lastActiveDate || new Date().toISOString().split('T')[0],
        heatStrip,
      },
      popularSensors: parsedPopularSensors,
      trendingTopics,
    });
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch dashboard payload' } });
  }
});

export default router;
