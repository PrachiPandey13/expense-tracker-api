const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const passport = require('passport');
const pool = require('../db');

const router = express.Router();
const SECRET = process.env.JWT_SECRET;

// 🔐 REGISTER
router.post('/register', async (req, res) => {
  const { username, password, role = 'user' } = req.body;
  const hash = await bcrypt.hash(password, 10);

  try {
    await pool.query(
      'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
      [username, hash, role]
    );
    res.status(201).send('User registered');
  } catch (err) {
    res.status(400).send('Username may already exist');
  }
});

// 🔐 LOGIN
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT * FROM users WHERE username = $1',
      [username]
    );
    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send('Invalid credentials');
    }

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      SECRET,
      { expiresIn: '1h' }
    );

    res.json({ token });
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).send('Server error');
  }
});

// 🔗 GOOGLE OAUTH START
router.get('/google',
  passport.authenticate('google', { scope: ['profile', 'email'] })
);

// 🔗 GOOGLE OAUTH CALLBACK
router.get('/google/callback',
  passport.authenticate('google', { failureRedirect: '/' }),
  (req, res) => {
    res.send('✅ Logged in with Google!');
  }
);

module.exports = router;
