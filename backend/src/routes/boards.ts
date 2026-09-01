import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Yeni pano oluştur
router.post("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { name, description } = req.body;

    if (!name) {
      return res.status(400).json({
        message: "Pano adı zorunludur.",
      });
    }

    const board = await prisma.board.create({
      data: {
        name,
        description,
        userId: req.user!.userId,
      },
    });

    res.status(201).json({
      message: "Pano başarıyla oluşturuldu.",
      board,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Pano oluşturulurken bir hata oluştu.",
    });
  }
});

// Kullanıcının panolarını getir
router.get("/", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const boards = await prisma.board.findMany({
      where: {
        userId: req.user!.userId,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    res.json({
      boards,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Panolar alınırken bir hata oluştu.",
    });
  }
});

export default router;