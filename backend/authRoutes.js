import express from "express";
import bcrypt from "bcryptjs";
import db from "./db.js";

const router = express.Router();

// Signup Route
router.post("/signup", (req, res) => {
  console.log('signup')
  const { username, password, role } = req.body;
  if (!username || !password || !role) {
    return res.status(400).json({ error: "All fields required" });
  }

  const hashedPassword = bcrypt.hashSync(password, 8);

  const query = `INSERT INTO users (username, password, role) VALUES (?, ?, ?);`
  db.run(query, [username, hashedPassword, role], function (err) {
    if (err) {
      console.error("Signup error:", err.message);
      return res.status(400).json({ error: "User already exists or DB error" });
    }
    res.json({ message: "User created", userId: this.lastID });
  });
});

// Login Route
router.post("/login", (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ error: "Username and password required" });
  }

  const query = `SELECT * FROM users WHERE username = ?;`

  db.get(query, [username], (err, user) => {
    if (err) {
      console.error("DB error:", err.message);
      return res.status(500).json({ error: "Database error" });
    }

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const passwordMatch = bcrypt.compareSync(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ error: "Invalid password" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  });
});

export default router;