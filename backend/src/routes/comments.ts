import { Router } from 'express';
import { prisma } from '../lib/prisma';
import {
    authenticateToken,
    AuthRequest,
} from '../middleware/auth';

const router = Router();

router.use(authenticateToken);

// Bir göreve ait yorumları getir
router.get('/task/:taskId', async (req: AuthRequest, res) => {
  try {
    const taskId = Number(req.params.taskId);

    if (Number.isNaN(taskId)) {
      return res.status(400).json({
        message: 'Geçersiz görev ID.',
      });
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        board: true,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: 'Görev bulunamadı.',
      });
    }

    if (task.board.userId !== req.user!.userId) {
      return res.status(403).json({
        message: 'Bu göreve erişim yetkiniz yok.',
      });
    }

    const comments = await prisma.comment.findMany({
      where: {
        taskId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'asc',
      },
    });

    return res.json({
      comments,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Yorumlar alınamadı.',
    });
  }
});

// Göreve yeni yorum ekle
router.post('/task/:taskId', async (req: AuthRequest, res) => {
  try {
    const taskId = Number(req.params.taskId);
    const content =
      typeof req.body.content === 'string'
        ? req.body.content.trim()
        : '';

    if (Number.isNaN(taskId)) {
      return res.status(400).json({
        message: 'Geçersiz görev ID.',
      });
    }

    if (!content) {
      return res.status(400).json({
        message: 'Yorum boş bırakılamaz.',
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({
        message: 'Yorum en fazla 1000 karakter olabilir.',
      });
    }

    const task = await prisma.task.findUnique({
      where: {
        id: taskId,
      },
      include: {
        board: true,
      },
    });

    if (!task) {
      return res.status(404).json({
        message: 'Görev bulunamadı.',
      });
    }

    if (task.board.userId !== req.user!.userId) {
      return res.status(403).json({
        message: 'Bu göreve erişim yetkiniz yok.',
      });
    }

    const comment = await prisma.comment.create({
      data: {
        content,
        taskId,
        userId: req.user!.userId,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    });

    return res.status(201).json({
      message: 'Yorum başarıyla eklendi.',
      comment,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Yorum eklenemedi.',
    });
  }
});

// Kendi yorumunu sil
router.delete('/:commentId', async (req: AuthRequest, res) => {
  try {
    const commentId = Number(req.params.commentId);

    if (Number.isNaN(commentId)) {
      return res.status(400).json({
        message: 'Geçersiz yorum ID.',
      });
    }

    const comment = await prisma.comment.findUnique({
      where: {
        id: commentId,
      },
    });

    if (!comment) {
      return res.status(404).json({
        message: 'Yorum bulunamadı.',
      });
    }

    if (comment.userId !== req.user!.userId) {
      return res.status(403).json({
        message: 'Bu yorumu silme yetkiniz yok.',
      });
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });

    return res.json({
      message: 'Yorum başarıyla silindi.',
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: 'Yorum silinemedi.',
    });
  }
});

export default router;