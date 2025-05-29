<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
const express = require('express');
const router = express.Router();
const razorpay = require('../utils/razorpay');
const crypto = require('crypto');
const auth = require('../middleware/auth');
const pool = require('../db');

// Create order
router.post('/order', auth, async (req, res) => {
  const options = {
    amount: 49900, // ₹499 in paise
    currency: 'INR',
    receipt: `receipt_order_${Date.now()}`
  };

  try {
    const order = await razorpay.orders.create(options);
    res.json({ orderId: order.id, key: process.env.RAZORPAY_KEY_ID });
  } catch (err) {
    console.error('Error creating order', err);
    res.status(500).send('Server Error');
  }
});

// Verify payment
router.post('/verify', auth, async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
  const body = razorpay_order_id + '|' + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
    .update(body)
    .digest('hex');

  if (expectedSignature === razorpay_signature) {
    // Upgrade user role to 'premium'
    await pool.query('UPDATE users SET role = $1 WHERE id = $2', ['premium', req.user.userId]);
    return res.send('Payment verified and role upgraded');
  }

  res.status(400).send('Invalid signature');
});

module.exports = router;