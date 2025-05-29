require('dotenv').config();

function checkApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'];

  if (!apiKey || apiKey !== process.env.ADMIN_API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid or missing API key' });
  }

  next();
}

module.exports = checkApiKey;
