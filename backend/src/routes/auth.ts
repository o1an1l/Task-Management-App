import bcrypt from "bcryptjs";
import "dotenv/config";
import { Router } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";
import {
  authenticateToken,
  AuthRequest,
} from "../middleware/auth";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email ve şifre zorunludur.",
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return res.status(409).json({
        message: "Bu email zaten kayıtlı.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    res.status(201).json({
      message: "Kullanıcı başarıyla oluşturuldu.",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Kullanıcı oluşturulurken bir hata oluştu.",
    });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(401).json({
        message: "Email veya şifre hatalı.",
      });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Email veya şifre hatalı.",
      });
    }

    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      {
        expiresIn: "1d",
      }
    );

    res.json({
      message: "Giriş başarılı.",
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Giriş yapılırken bir hata oluştu.",
    });
  }
});

// Kayıtlı kullanıcıları getir
router.get(
  "/users",
  authenticateToken,
  async (req: AuthRequest, res) => {
    try {
      const users = await prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
        },
        orderBy: {
          id: "asc",
        },
      });

      res.json({
        users,
      });
    } catch (error) {
      console.error(error);

      res.status(500).json({
        message: "Kullanıcılar alınırken bir hata oluştu.",
      });
    }
  }
);

export default router;