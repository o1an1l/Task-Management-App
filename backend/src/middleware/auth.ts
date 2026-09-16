import { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma";

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    id: number;
    email: string;
    name?: string | null;
  };
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;

  const token = authHeader?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      message: "Yetkilendirme token'ı bulunamadı.",
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET!
    ) as {
      userId: number;
      email: string;
    };

    const user = await prisma.user.findUnique({
      where: {
        id: decoded.userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return res.status(401).json({
        message: "Kullanıcı bulunamadı.",
      });
    }

    req.user = {
      userId: user.id,
      id: user.id,
      email: user.email,
      name: user.name,
    };

    next();
  } catch (error) {
    console.error(error);

    return res.status(403).json({
      message: "Geçersiz veya süresi dolmuş token.",
    });
  }
};