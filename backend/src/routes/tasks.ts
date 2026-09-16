import { Router } from "express";
import { prisma } from "../lib/prisma";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth";

const router = Router();

const isValidPriority = (priority: string) => {
  return ["LOW", "MEDIUM", "HIGH"].includes(priority);
};

const validateTaskTitle = (title: string) => {
  const trimmedTitle = title.trim();

  if (trimmedTitle.length < 2) {
    return "Görev başlığı en az 2 karakter olmalıdır.";
  }

  if (trimmedTitle.length > 150) {
    return "Görev başlığı en fazla 150 karakter olabilir.";
  }

  return null;
};

const validateDescription = (
  description: string | null | undefined
) => {
  if (description === undefined || description === null) {
    return null;
  }

  if (description.length > 1000) {
    return "Görev açıklaması en fazla 1000 karakter olabilir.";
  }

  return null;
};

const validateDueDate = (
  dueDate: string | null | undefined
) => {
  if (!dueDate) {
    return null;
  }

  const date = new Date(dueDate);

  if (isNaN(date.getTime())) {
    return "Geçersiz son tarih.";
  }

  // Bugünün tarihine izin ver, geçmiş günleri engelle.
  date.setHours(23, 59, 59, 999);

  if (date < new Date()) {
    return "Son tarih geçmiş bir tarih olamaz.";
  }

  return null;
};

// Yeni görev oluştur
router.post(
  "/",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const {
        boardId,
        listId,
        title,
        description,
        status,
        order,
        priority,
        dueDate,
        assigneeId,
      } = req.body;

      if (!boardId || !title) {
        return res.status(400).json({
          message: "Pano ve görev adı zorunludur.",
        });
      }

      const titleError = validateTaskTitle(title);

      if (titleError) {
        return res.status(400).json({
          message: titleError,
        });
      }

      const descriptionError =
        validateDescription(description);

      if (descriptionError) {
        return res.status(400).json({
          message: descriptionError,
        });
      }

      const selectedPriority =
        priority || "MEDIUM";

      if (!isValidPriority(selectedPriority)) {
        return res.status(400).json({
          message:
            "Geçersiz öncelik. Düşük, Orta veya Yüksek seçilmelidir.",
        });
      }

      const dueDateError =
        validateDueDate(dueDate);

      if (dueDateError) {
        return res.status(400).json({
          message: dueDateError,
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

      let selectedListId: number | null = null;

      // listId gönderildiyse kontrol et
      if (
        listId !== undefined &&
        listId !== null
      ) {
        const selectedList =
          await prisma.list.findFirst({
            where: {
              id: Number(listId),
              boardId: board.id,
            },
          });

        if (!selectedList) {
          return res.status(404).json({
            message: "Kolon bulunamadı.",
          });
        }

        selectedListId = selectedList.id;
      } else {
        // Eski status sistemi için geçici uyumluluk
        const statusOrderMap: Record<
          string,
          number
        > = {
          TODO: 0,
          IN_PROGRESS: 1,
          DONE: 2,
        };

        const targetOrder =
          statusOrderMap[status || "TODO"] ?? 0;

        const defaultList =
          await prisma.list.findFirst({
            where: {
              boardId: board.id,
              order: targetOrder,
            },
          });

        if (defaultList) {
          selectedListId = defaultList.id;
        }
      }

      let selectedAssigneeId:
        number | null = null;

      if (
        assigneeId !== undefined &&
        assigneeId !== null &&
        assigneeId !== ""
      ) {
        const assignee =
          await prisma.user.findUnique({
            where: {
              id: Number(assigneeId),
            },
          });

        if (!assignee) {
          return res.status(404).json({
            message: "Atanan kullanıcı bulunamadı.",
          });
        }

        selectedAssigneeId = assignee.id;
      }

      let newOrder = 0;

      if (selectedListId !== null) {
        const lastTask =
          await prisma.task.findFirst({
            where: {
              listId: selectedListId,
            },
            orderBy: {
              order: "desc",
            },
          });

        newOrder = lastTask
          ? lastTask.order + 1
          : 0;
      }

      const task = await prisma.task.create({
        data: {
          title: title.trim(),
          description:
            description?.trim() || null,
          status: status || "TODO",
          priority: selectedPriority,
          dueDate: dueDate
            ? new Date(dueDate)
            : null,
          assigneeId: selectedAssigneeId,
          order:
            order !== undefined
              ? Number(order)
              : newOrder,
          boardId: board.id,
          listId: selectedListId,
        },
      });

      const createdTask =
        await prisma.task.findUnique({
          where: {
            id: task.id,
          },
          include: {
            list: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

      res.status(201).json({
        message:
          "Görev başarıyla oluşturuldu.",
        task: createdTask,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Görev oluşturulurken bir hata oluştu.",
      });
    }
  }
);

// Panoya ait görevleri getir
router.get(
  "/board/:boardId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const boardId = Number(
        req.params.boardId
      );

      const board =
        await prisma.board.findFirst({
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

      const tasks =
        await prisma.task.findMany({
          where: {
            boardId: board.id,
          },
          include: {
            list: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
          orderBy: [
            {
              listId: "asc",
            },
            {
              order: "asc",
            },
            {
              createdAt: "asc",
            },
          ],
        });

      res.json({
        tasks,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Görevler alınırken bir hata oluştu.",
      });
    }
  }
);

// UPDATE TASK
router.put(
  "/:taskId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const taskId = Number(
        req.params.taskId
      );

      const {
        title,
        description,
        status,
        listId,
        order,
        priority,
        dueDate,
        assigneeId,
      } = req.body;

      const task =
        await prisma.task.findFirst({
          where: {
            id: taskId,
            board: {
              userId: req.user!.userId,
            },
          },
        });

      if (!task) {
        return res.status(404).json({
          message: "Görev bulunamadı.",
        });
      }

      if (title !== undefined) {
        const titleError =
          validateTaskTitle(title);

        if (titleError) {
          return res.status(400).json({
            message: titleError,
          });
        }
      }

      if (description !== undefined) {
        const descriptionError =
          validateDescription(description);

        if (descriptionError) {
          return res.status(400).json({
            message: descriptionError,
          });
        }
      }

      if (
        priority !== undefined &&
        !isValidPriority(priority)
      ) {
        return res.status(400).json({
          message:
            "Geçersiz öncelik. Düşük, Orta veya Yüksek seçilmelidir.",
        });
      }

      if (dueDate !== undefined) {
        const dueDateError =
          validateDueDate(dueDate);

        if (dueDateError) {
          return res.status(400).json({
            message: dueDateError,
          });
        }
      }

      let selectedListId =
        task.listId;

      if (listId !== undefined) {
        if (listId === null) {
          selectedListId = null;
        } else {
          const selectedList =
            await prisma.list.findFirst({
              where: {
                id: Number(listId),
                boardId: task.boardId,
              },
            });

          if (!selectedList) {
            return res.status(404).json({
              message:
                "Kolon bulunamadı.",
            });
          }

          selectedListId = selectedList.id;
        }
      }

      let selectedAssigneeId =
        task.assigneeId;

      if (
        assigneeId !== undefined
      ) {
        if (
          assigneeId === null ||
          assigneeId === ""
        ) {
          selectedAssigneeId = null;
        } else {
          const assignee =
            await prisma.user.findUnique({
              where: {
                id: Number(assigneeId),
              },
            });

          if (!assignee) {
            return res.status(404).json({
              message:
                "Atanan kullanıcı bulunamadı.",
            });
          }

          selectedAssigneeId =
            assignee.id;
        }
      }

      const updatedTask =
        await prisma.task.update({
          where: {
            id: task.id,
          },
          data: {
            ...(title !== undefined && {
              title: title.trim(),
            }),

            ...(description !== undefined && {
              description:
                description?.trim() || null,
            }),

            ...(status !== undefined && {
              status,
            }),

            ...(priority !== undefined && {
              priority,
            }),

            ...(dueDate !== undefined && {
              dueDate: dueDate
                ? new Date(dueDate)
                : null,
            }),

            ...(assigneeId !== undefined && {
              assigneeId:
                selectedAssigneeId,
            }),

            ...(listId !== undefined && {
              listId:
                selectedListId,
            }),

            ...(order !== undefined && {
              order: Number(order),
            }),
          },
          include: {
            list: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

      res.json({
        message:
          "Görev başarıyla güncellendi.",
        task: updatedTask,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Görev güncellenirken bir hata oluştu.",
      });
    }
  }
);

// Görevi başka kolona / sıraya taşı
router.patch(
  "/:taskId/move",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const taskId = Number(
        req.params.taskId
      );

      const { listId, order } =
        req.body;

      if (
        listId === undefined ||
        order === undefined
      ) {
        return res.status(400).json({
          message:
            "Kolon ve sıra bilgisi zorunludur.",
        });
      }

      const task =
        await prisma.task.findFirst({
          where: {
            id: taskId,
            board: {
              userId:
                req.user!.userId,
            },
          },
        });

      if (!task) {
        return res.status(404).json({
          message:
            "Görev bulunamadı.",
        });
      }

      const targetList =
        await prisma.list.findFirst({
          where: {
            id: Number(listId),
            boardId: task.boardId,
          },
        });

      if (!targetList) {
        return res.status(404).json({
          message:
            "Hedef kolon bulunamadı.",
        });
      }

      const newOrder =
        Number(order);

      if (
        !Number.isInteger(newOrder) ||
        newOrder < 0
      ) {
        return res.status(400).json({
          message:
            "Geçersiz sıra bilgisi.",
        });
      }

      /*
       * Hedef kolondaki diğer görevleri al.
       * Sürüklenen görevi listeden çıkardığımız
       * için önce onu hariç tutuyoruz.
       */
      const targetTasks =
        await prisma.task.findMany({
          where: {
            listId:
              targetList.id,
            id: {
              not: task.id,
            },
          },
          orderBy: {
            order: "asc",
          },
        });

      /*
       * Kullanıcı çok büyük bir sıra gönderirse
       * listenin sonuna koy.
       */
      const safeOrder =
        Math.min(
          newOrder,
          targetTasks.length
        );

      /*
       * Görevi yeni pozisyonuna ekle.
       */
      targetTasks.splice(
        safeOrder,
        0,
        task
      );

      /*
       * Eğer görev farklı bir kolondan
       * geldiyse eski kolonun sırasını
       * yeniden düzenle.
       */
      if (
        task.listId !== null &&
        task.listId !== targetList.id
      ) {
        const sourceTasks =
          await prisma.task.findMany({
            where: {
              listId:
                task.listId,
              id: {
                not: task.id,
              },
            },
            orderBy: {
              order: "asc",
            },
          });

        for (
          let index = 0;
          index < sourceTasks.length;
          index++
        ) {
          await prisma.task.update({
            where: {
              id:
                sourceTasks[index].id,
            },
            data: {
              order: index,
            },
          });
        }
      }

      /*
       * Hedef kolonun bütün görevlerini
       * 0,1,2,3... şeklinde yeniden sırala.
       */
      for (
        let index = 0;
        index < targetTasks.length;
        index++
      ) {
        await prisma.task.update({
          where: {
            id:
              targetTasks[index].id,
          },
          data: {
            listId:
              targetList.id,
            order: index,
          },
        });
      }

      /*
       * Güncellenen görevi ilişkileriyle
       * birlikte tekrar getir.
       */
      const updatedTask =
        await prisma.task.findUnique({
          where: {
            id: task.id,
          },
          include: {
            list: true,
            assignee: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

      res.json({
        message:
          "Görev başarıyla taşındı.",
        task: updatedTask,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Görev taşınırken bir hata oluştu.",
      });
    }
  }
);

// DELETE TASK
router.delete(
  "/:taskId",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const taskId = Number(
        req.params.taskId
      );

      const task =
        await prisma.task.findFirst({
          where: {
            id: taskId,
            board: {
              userId:
                req.user!.userId,
            },
          },
        });

      if (!task) {
        return res.status(404).json({
          message:
            "Görev bulunamadı.",
        });
      }

      await prisma.task.delete({
        where: {
          id: task.id,
        },
      });

      res.json({
        message:
          "Görev başarıyla silindi.",
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message:
          "Görev silinirken bir hata oluştu.",
      });
    }
  }
);

export default router;