import { prisma } from "./lib/prisma";
import express from "express";
import cors from "cors";
import "dotenv/config";
import authRoutes from "./routes/auth";
import { authenticateToken, AuthRequest } from "./middleware/auth";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.json({
    message: "Backend çalışıyor!",
  });
});

app.get("/test-db", async (req, res) => {
  try {
    const userCount = await prisma.user.count();

    res.json({
      message: "Veritabanı bağlantısı başarılı!",
      userCount,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Veritabanına bağlanılamadı.",
    });
  }
});

app.get("/profile", authenticateToken, (req: AuthRequest, res) => {
  res.json({
    message: "Profil bilgilerine eriştin.",
    user: req.user,
  });
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Backend http://localhost:${PORT} adresinde çalışıyor.`);
});