const express = require('express');
const router = express.Router();
const pool = require('../db');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const SECRET = process.env.JWT_SECRET;

// Email transporter setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,     // Your email
    pass: process.env.EMAIL_PASS      // Your app password
  }
});

// 1. Request OTP
router.post('/request-otp', async (req, res) => {
  const { username } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) return res.status(404).send('User not found');

  const otp = Math.floor(100000 + Math.random() * 900000).toString();
  const expiry = new Date(Date.now() + 5 * 60 * 1000); // 5 min

  await pool.query(
    'UPDATE users SET otp = $1, otp_expiry = $2 WHERE id = $3',
    [otp, expiry, user.id]
  );

  // Send OTP email
  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: username, // assuming username = email
    subject: 'Your Login OTP',
    text: `Your OTP is: ${otp}`
  });

  res.send('OTP sent to your email');
});

// 2. Verify OTP and return JWT
router.post('/verify-otp', async (req, res) => {
  const { username, otp } = req.body;

  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = result.rows[0];
  if (!user) return res.status(404).send('User not found');

  if (
    user.otp !== otp ||
    !user.otp_expiry ||
    new Date(user.otp_expiry) < new Date()
  ) {
    return res.status(401).send('Invalid or expired OTP');
  }

  // Clear OTP after success
  await pool.query('UPDATE users SET otp = NULL, otp_expiry = NULL WHERE id = $1', [user.id]);

  const token = jwt.sign({ userId: user.id, role: user.role }, SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports = router;
