import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Yeni görev oluştur
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { boardId, title, description, status } = req.body;

    if (!boardId || !title) {
      return res.status(400).json({
        message: "Pano ve görev adı zorunludur.",
      });
    }

    const board = await prisma.board.findFirst({
      where: {
        id: Number(boardId),
        userId: req.user!.userId,
      },
    });

    if (!board) {
      return res.status(404).json({
        message: "Pano bulunamadı.",
      });
    }

    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "TODO",
        boardId: board.id,
      },
    });

    res.status(201).json({
      message: "Görev başarıyla oluşturuldu.",
      task,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Görev oluşturulurken bir hata oluştu.",
    });
  }
});

// Panoya ait görevleri getir
router.get(
  "/board/:boardId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const boardId = Number(req.params.boardId);

      const board = await prisma.board.findFirst({
        where: {
          id: boardId,
          userId: req.user!.userId,
        },
      });

      if (!board) {
        return res.status(404).json({
          message: "Pano bulunamadı.",
        });
      }

      const tasks = await prisma.task.findMany({
        where: {
          boardId: board.id,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      res.json({
        tasks,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Görevler alınırken bir hata oluştu.",
      });
    }
  }
);

export default router;