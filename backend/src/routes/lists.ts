import { Router } from "express";
import { prisma } from "../lib/prisma";
import { authenticateToken, AuthRequest } from "../middleware/auth";

const router = Router();

// Panoya ait kolonları getir
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
          message: "Pano bulunamadi.",
        });
      }

      const lists = await prisma.list.findMany({
        where: {
          boardId,
        },
        orderBy: {
          order: "asc",
        },
      });

      res.json({
        lists,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Kolonlar alınırken bir hata oluştu.",
      });
    }
  }
);

// Yeni kolon oluştur
router.post(
  "/board/:boardId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const boardId = Number(req.params.boardId);
      const { title } = req.body;

      if (!title || title.trim() === "") {
        return res.status(400).json({
          message: "Kolon başlığı zorunludur.",
        });
      }

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

      const lastList = await prisma.list.findFirst({
        where: {
          boardId,
        },
        orderBy: {
          order: "desc",
        },
      });

      const newOrder = lastList
        ? lastList.order + 1
        : 0;

      const list = await prisma.list.create({
        data: {
          title: title.trim(),
          order: newOrder,
          boardId,
        },
      });

      res.status(201).json({
        message: "Kolon başarıyla oluşturuldu.",
        list,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Kolon oluşturulurken bir hata oluştu.",
      });
    }
  }
);

// Tek bir kolonu getir
router.get(
  "/:listId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const listId = Number(req.params.listId);

      const list = await prisma.list.findFirst({
        where: {
          id: listId,
          board: {
            userId: req.user!.userId,
          },
        },
      });

      if (!list) {
        return res.status(404).json({
          message: "Kolon bulunamadı.",
        });
      }

      res.json({
        list,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Kolon alınırken bir hata oluştu.",
      });
    }
  }
);

// Kolon güncelle
router.put(
  "/:listId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const listId = Number(req.params.listId);
      const { title, order } = req.body;

      const list = await prisma.list.findFirst({
        where: {
          id: listId,
          board: {
            userId: req.user!.userId,
          },
        },
      });

      if (!list) {
        return res.status(404).json({
          message: "Kolon bulunamadı.",
        });
      }

      const updatedList = await prisma.list.update({
        where: {
          id: list.id,
        },
        data: {
          ...(title !== undefined &&
            title.trim() !== "" && {
              title: title.trim(),
            }),

          ...(order !== undefined && {
            order,
          }),
        },
      });

      res.json({
        message: "Kolon başarıyla güncellendi.",
        list: updatedList,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Kolon güncellenirken bir hata oluştu.",
      });
    }
  }
);

// Kolon sil
router.delete(
  "/:listId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const listId = Number(req.params.listId);

      const list = await prisma.list.findFirst({
        where: {
          id: listId,
          board: {
            userId: req.user!.userId,
          },
        },
      });

      if (!list) {
        return res.status(404).json({
          message: "Kolon bulunamadı.",
        });
      }

      // Önce bu kolondaki görevleri sil
      await prisma.task.deleteMany({
        where: {
          listId: list.id,
        },
      });

      // Daha sonra kolonu sil
      await prisma.list.delete({
        where: {
          id: list.id,
        },
      });

      res.json({
        message:
          "Kolon ve kolona ait görevler başarıyla silindi.",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Kolon silinirken bir hata oluştu.",
      });
    }
  }
);

export default router;