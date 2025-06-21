import express from "express";
import cors from 'cors'
import authRoutes from "./authRoutes.js";
import medRoutes from "./medRoutes.js";

const app = express();
app.use(cors())
app.use(express.json());

app.use("/med", medRoutes);

// Route prefix for auth
app.use("/auth", authRoutes);

app.get("/", (req, res) => {
  res.send("Backend is running!");
});

app.listen(5000, () => {
  console.log("🚀 Server running on http://localhost:5000");
});