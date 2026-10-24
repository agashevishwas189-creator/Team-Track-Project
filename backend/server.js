const fs = require("fs");
const path = require("path");
const express = require("express");
const cors = require("cors");
const mysql = require("mysql2/promise");

const app = express();
const PORT = process.env.PORT || 5000;

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  ssl: {
    ca: fs.readFileSync(path.join(__dirname, "global-bundle.pem")),
    rejectUnauthorized: true,
  },
  waitForConnections: true,
  connectionLimit: 10,
  connectTimeout: 10000,
});

app.use(cors());
app.use(express.json());

// Probes ke liye (DB check nahi)
app.get("/health", (req, res) => res.json({ status: "healthy" }));

app.get("/api", (req, res) => {
  res.json({ message: "Team Track API is running!", status: "success" });
});

app.get("/api/health", async (req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ status: "healthy", database: "connected" });
  } catch (err) {
    console.error("DB error:", err.message);
    res.status(500).json({ status: "unhealthy", database: "disconnected" });
  }
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Team Track API running on port ${PORT}`);
});
