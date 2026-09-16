import cors from "cors";
import "dotenv/config";
import express from "express";
import { prisma } from "./lib/prisma";
import { authenticateToken, AuthRequest } from "./middleware/auth";
import authRoutes from "./routes/auth";
import boardRoutes from "./routes/boards";
import listRoutes from "./routes/lists";
import taskRoutes from "./routes/tasks";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/auth", authRoutes);
app.use("/boards", boardRoutes);
app.use("/tasks", taskRoutes);
app.use("/lists", listRoutes);

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

const PORT = Number(process.env.PORT) || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Backend ${PORT} portunda çalışıyor.`);
});