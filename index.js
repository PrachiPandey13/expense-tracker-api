const express = require('express');
const dotenv = require('dotenv');
const session = require('express-session');
const passport = require('passport');

dotenv.config();
require('./auth/passport'); // Google OAuth strategy

const app = express(); // ✅ MUST be declared before use

// Enable sessions for Google login
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true
}));

// Initialize passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Body parser middleware
app.use(express.json());

// Routes
const authRoutes = require('./routes/auth');
const otpRoutes = require('./routes/otp');

app.use('/auth', authRoutes); // register, login, Google
app.use('/otp', otpRoutes);   // email OTP

// Home test route
app.get('/', (req, res) => {
  res.send('✅ API is running...');
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));

//payments
const paymentRoutes = require('./routes/payment');
app.use('/payment', paymentRoutes);
