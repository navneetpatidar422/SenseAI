import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { streamAIResponse } from '../services/aiService.js';

const router = Router();
const prisma = new PrismaClient();

router.get('/chats', async (req, res) => {
  try {
    const chats = await prisma.chat.findMany({
      orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 100,
        },
      },
    });
    res.json(chats);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch chats' } });
  }
});

router.get('/chats/:id', async (req, res) => {
  try {
    const chat = await prisma.chat.findUnique({
      where: { id: req.params.id },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });
    if (!chat) {
      return res.status(404).json({ error: { message: 'Chat not found' } });
    }
    res.json(chat);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to fetch chat' } });
  }
});

router.post('/chat/stream', async (req, res) => {
  try {
    const { chatId, message, mode = 'chat' } = req.body;

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: { message: 'Message string is required' } });
    }

    let activeChatId = chatId;
    if (!activeChatId) {
      const title = message.length > 30 ? message.substring(0, 30) + '...' : message;
      const newChat = await prisma.chat.create({
        data: { title },
      });
      activeChatId = newChat.id;
    }

    await prisma.message.create({
      data: {
        chatId: activeChatId,
        role: 'user',
        content: message,
      },
    });

    const historyMessages = await prisma.message.findMany({
      where: { chatId: activeChatId },
      orderBy: { createdAt: 'asc' },
    });

    const formattedHistory = historyMessages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    const fullAssistantResponse = await streamAIResponse(
      mode as any,
      message,
      res,
      formattedHistory.slice(0, -1)
    );

    if (fullAssistantResponse) {
      await prisma.message.create({
        data: {
          chatId: activeChatId,
          role: 'assistant',
          content: fullAssistantResponse,
        },
      });

      await prisma.chat.update({
        where: { id: activeChatId },
        data: { updatedAt: new Date() },
      });
    }
  } catch (err) {
    console.error('Chat stream error:', err);
    if (!res.headersSent) {
      res.status(500).json({ error: { message: 'Failed to stream chat response' } });
    }
  }
});

router.patch('/chats/:id', async (req, res) => {
  try {
    const { title, pinned } = req.body;
    const updated = await prisma.chat.update({
      where: { id: req.params.id },
      data: {
        ...(title !== undefined && { title }),
        ...(pinned !== undefined && { pinned }),
      },
    });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to update chat' } });
  }
});

router.delete('/chats/:id', async (req, res) => {
  try {
    await prisma.chat.delete({
      where: { id: req.params.id },
    });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: { message: 'Failed to delete chat' } });
  }
});

export default router;
