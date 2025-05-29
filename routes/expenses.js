const express = require('express');
const router = express.Router();
const pool = require('../db');
const authenticateJWT = require('../middleware/auth'); // If using JWT middleware
const checkRole = require('../middleware/checkRole'); // For role-based access

// POST new expense
router.post('/', authenticateJWT, async (req, res) => {
  const { amount, category, description } = req.body;
  const result = await pool.query(
    'INSERT INTO expenses (user_id, amount, category, description) VALUES ($1, $2, $3, $4) RETURNING *',
    [req.user.userId, amount, category, description]
  );
  res.status(201).json(result.rows[0]);
});

// GET all expenses (optional)
router.get('/', authenticateJWT, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM expenses WHERE user_id = $1 ORDER BY date DESC',
    [req.user.userId]
  );
  res.json(result.rows);
});

// GET category-wise summary
router.get('/summary/categories', authenticateJWT, async (req, res) => {
  const result = await pool.query(
    'SELECT category, SUM(amount) AS total FROM expenses WHERE user_id = $1 GROUP BY category',
    [req.user.userId]
  );
  res.json(result.rows);
});

// GET top 3 expenses
router.get('/summary/top', authenticateJWT, async (req, res) => {
  const result = await pool.query(
    'SELECT * FROM expenses WHERE user_id = $1 ORDER BY amount DESC LIMIT 3',
    [req.user.userId]
  );
  res.json(result.rows);
});

// GET last 30 days expense summary
router.get('/summary/last30days', authenticateJWT, async (req, res) => {
  const result = await pool.query(
    `SELECT category, SUM(amount) AS total
     FROM expenses
     WHERE user_id = $1 AND date >= CURRENT_DATE - INTERVAL '30 days'
     GROUP BY category`,
    [req.user.userId]
  );
  res.json(result.rows);
});

// ✅ Route to auto-generate sample expenses (admin only)
router.post('/seed', authenticateJWT, checkRole(['admin']), async (req, res) => {
  const userId = req.user.userId;

  try {
    for (let i = 0; i < 10; i++) {
      await pool.query(
        'INSERT INTO expenses (user_id, amount, category, description) VALUES ($1, $2, $3, $4)',
        [userId, Math.floor(Math.random() * 1000), 'misc', `Test expense ${i + 1}`]
      );
    }

    res.status(201).json({ message: '10 test expenses added' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to seed expenses' });
  }
});

module.exports = router;
