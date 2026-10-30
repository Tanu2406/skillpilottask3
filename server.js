require('dotenv').config();

const express = require('express');
const connectDB = require('./config/db');
const authenticateToken = require('./middleware/authenticateToken');
const authRouter = require('./routes/auth');
const notesRouter = require('./routes/notes');

const app = express();
const port = Number(process.env.PORT) || 3000;

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', process.env.CLIENT_ORIGIN || 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  return next();
});

app.use('/api/notes', authenticateToken);
app.use(express.json({ limit: '1mb' }));
app.use('/api/auth', authRouter);
app.use('/api/notes', notesRouter);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found.'
  });
});

app.use((error, req, res, next) => {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      message: 'Request body contains invalid JSON.'
    });
  }

  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: error.message
    });
  }

  console.error('Request failed:', error);
  return res.status(500).json({
    success: false,
    message: 'Internal server error.'
  });
});

async function startServer() {
  await connectDB();

  app.listen(port, () => {
    console.log(`Notes API is listening at http://localhost:${port}`);
  });
}

if (require.main === module) {
  startServer().catch((error) => {
    console.error('Could not start the Notes API:', error.message);
    process.exitCode = 1;
  });
}

module.exports = app;
