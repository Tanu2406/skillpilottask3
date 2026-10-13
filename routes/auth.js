const express = require('express');
const jwt = require('jsonwebtoken');

const router = express.Router();
const tokenLifetime = '1h';

router.post('/login', (req, res, next) => {
  const { AUTH_USERNAME, AUTH_PASSWORD, JWT_SECRET } = process.env;
  if (!AUTH_USERNAME || !AUTH_PASSWORD || !JWT_SECRET) {
    return next(new Error('Authentication environment variables are not configured.'));
  }

  const { username, password } = req.body || {};
  if (typeof username !== 'string' || typeof password !== 'string') {
    return res.status(400).json({
      success: false,
      message: 'Username and password are required.'
    });
  }

  if (username !== AUTH_USERNAME || password !== AUTH_PASSWORD) {
    return res.status(401).json({
      success: false,
      message: 'Invalid username or password.'
    });
  }

  const token = jwt.sign({ sub: username }, JWT_SECRET, {
    expiresIn: tokenLifetime
  });

  return res.status(200).json({
    success: true,
    data: {
      token,
      tokenType: 'Bearer',
      expiresIn: tokenLifetime
    }
  });
});

module.exports = router;
