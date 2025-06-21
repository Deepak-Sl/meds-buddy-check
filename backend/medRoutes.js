import express from "express";
import db from "./db.js";

const router = express.Router();

// Add Medication
router.post("/add", (req, res) => {
  const { user_id, name, dosage, frequency } = req.body;
  if (!user_id || !name || !dosage || !frequency) {
    return res.status(400).json({ error: "All fields required" });
  }

  const query = `INSERT INTO medications (user_id, name, dosage, frequency) VALUES (?, ?, ?, ?);`

  db.run(query, [user_id, name, dosage, frequency], function (err) {
    if (err) {
      console.error("Insert error:", err.message);
      return res.status(500).json({ error: "Database insert error" });
    }
    res.json({ message: "Medication added", medId: this.lastID });
  });
});

// ✅ Mark Medication as Taken
router.post("/mark-taken", (req, res) => {
  const { med_id, date } = req.body;
  if (!med_id || !date) {
    return res.status(400).json({ error: "med_id and date required" });
  }

  const selectQuery = `SELECT taken_dates FROM medications WHERE id = ?;`
  db.get(selectQuery, [med_id], (err, row) => {
    if (err || !row) {
      return res.status(404).json({ error: "Medication not found" });
    }

    let takenDates = [];
    try {
      takenDates = JSON.parse(row.taken_dates || "[]");
    } catch (e) {
      takenDates = [];
    }

    if (!takenDates.includes(date)) {
      takenDates.push(date);
    }

    const updatedDates = JSON.stringify(takenDates);
    const updateQuery = `UPDATE medications SET taken_dates = ? WHERE id = ?;`

    db.run(updateQuery, [updatedDates, med_id], function (err) {
      if (err) {
        return res.status(500).json({ error: "Failed to update taken_dates" });
      }

      res.json({ message: "Marked as taken", dates: takenDates });
    });
  });
});

// Get Medications for a User
router.get("/list", (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const query = `SELECT * FROM medications WHERE user_id = ?;`

  db.all(query, [user_id], (err, rows) => {
    if (err) {
      console.error("DB fetch error:", err.message);
      return res.status(500).json({ error: "Database fetch error" });
    }

    res.json({ medications: rows });
  });
});

// 📊 Calculate Adherence for a User
router.get("/adherence", (req, res) => {
  const { user_id } = req.query;
  if (!user_id) {
    return res.status(400).json({ error: "user_id is required" });
  }

  const query = `SELECT id, name, taken_dates FROM medications WHERE user_id = ?;`
  db.all(query, [user_id], (err, rows) => {
    if (err) {
      return res.status(500).json({ error: "Database error" });
    }

    const result = rows.map((med) => {
      let taken = 0;
      try {
        taken = JSON.parse(med.taken_dates || "[]").length;
      } catch {
        taken = 0;
      }

      const expected = 7; // Assume 7-day tracking
      const adherence = ((taken / expected) * 100).toFixed(1) + "%";

      return {
        id: med.id,
        name: med.name,
        adherence,
      };
    });

    res.json({ adherenceReport: result });
  });
});

export default router;