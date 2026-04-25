import dotenv from "dotenv";
dotenv.config();

import express from "express";
import authRoutes from "./src/routes/authRoutes.js";
const app = express();
import { pool } from "./src/config/database.js";

pool.query("SELECT 1")
  .then(() => console.log("DB connected"))
  .catch(err => console.error("DB connection error:", err));

app.use(express.json());

app.get("/", (req, res) => {
  res.send("API Running...");
});

const PORT = process.env.PORT;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use('/auth', authRoutes);