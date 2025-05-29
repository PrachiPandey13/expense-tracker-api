const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const pool = require('../db'); // your PostgreSQL connection
require('dotenv').config();

passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, async (accessToken, refreshToken, profile, done) => {
  const email = profile.emails[0].value;

  try {
    // Check if user already exists
    let result = await pool.query('SELECT * FROM users WHERE username = $1', [email]);

    if (result.rows.length === 0) {
      // If not, create a new user
      await pool.query(
        'INSERT INTO users (username, password, role) VALUES ($1, $2, $3)',
        [email, '', 'user']
      );
      result = await pool.query('SELECT * FROM users WHERE username = $1', [email]);
    }

    return done(null, result.rows[0]);
  } catch (err) {
    console.error('Google login error:', err);
    return done(err, null);
  }
}));

passport.serializeUser((user, done) => {
  done(null, user.id); // Store only user ID in session
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err, null);
  }
});
