import { PrismaClient } from '@prisma/client';
import { SENSORS_DATA, PROTOCOLS_DATA, PROMPTS_DATA } from './seedData.js';

const prisma = new PrismaClient();

export async function runSeed() {
  console.log('🌱 Starting SenseAI database seed...');

  // Seed Sensors
  console.log(`Populating ${SENSORS_DATA.length} sensors...`);
  for (const s of SENSORS_DATA) {
    await prisma.sensor.upsert({
      where: { slug: s.slug },
      update: {
        name: s.name,
        category: s.category,
        description: s.description,
        aliases: JSON.stringify(s.aliases),
        specs: JSON.stringify(s.specs),
        pinout: JSON.stringify(s.pinout),
        sampleCode: JSON.stringify(s.sampleCode),
        calibrationGuide: s.calibrationGuide,
        industrialUse: s.industrialUse,
        commonMistakes: JSON.stringify(s.commonMistakes),
      },
      create: {
        slug: s.slug,
        name: s.name,
        category: s.category,
        description: s.description,
        aliases: JSON.stringify(s.aliases),
        specs: JSON.stringify(s.specs),
        pinout: JSON.stringify(s.pinout),
        sampleCode: JSON.stringify(s.sampleCode),
        calibrationGuide: s.calibrationGuide,
        industrialUse: s.industrialUse,
        commonMistakes: JSON.stringify(s.commonMistakes),
      },
    });
  }

  // Seed Protocols
  console.log(`Populating ${PROTOCOLS_DATA.length} protocols...`);
  for (const p of PROTOCOLS_DATA) {
    await prisma.protocol.upsert({
      where: { slug: p.slug },
      update: {
        name: p.name,
        category: p.category,
        layer: p.layer,
        summary: p.summary,
        mermaidDiagram: p.mermaidDiagram,
        specs: JSON.stringify(p.specs),
        pros: JSON.stringify(p.pros),
        cons: JSON.stringify(p.cons),
        realWorldUseCases: JSON.stringify(p.realWorldUseCases),
      },
      create: {
        slug: p.slug,
        name: p.name,
        category: p.category,
        layer: p.layer,
        summary: p.summary,
        mermaidDiagram: p.mermaidDiagram,
        specs: JSON.stringify(p.specs),
        pros: JSON.stringify(p.pros),
        cons: JSON.stringify(p.cons),
        realWorldUseCases: JSON.stringify(p.realWorldUseCases),
      },
    });
  }

  // Seed Prompts
  console.log(`Populating ${PROMPTS_DATA.length} prompts...`);
  const existingPrompts = await prisma.prompt.count();
  if (existingPrompts === 0) {
    for (const pr of PROMPTS_DATA) {
      await prisma.prompt.create({
        data: {
          category: pr.category,
          title: pr.title,
          preview: pr.preview,
          content: pr.content,
          targetFeature: pr.targetFeature,
          isFavorite: false,
        },
      });
    }
  }

  // Seed UserStats
  await prisma.userStats.upsert({
    where: { id: 'user_default' },
    update: {},
    create: {
      id: 'user_default',
      streakCount: 5,
      lastActiveDate: new Date().toISOString().split('T')[0],
      activityLog: JSON.stringify([new Date().toISOString().split('T')[0]]),
    },
  });

  console.log('✅ SenseAI database seed completed successfully!');
}

if (process.argv[1]?.includes('runSeed')) {
  runSeed()
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
