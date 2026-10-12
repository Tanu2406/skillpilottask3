const mongoose = require('mongoose');

async function connectDB() {
  const { MONGODB_URI } = process.env;

  if (!MONGODB_URI) {
    throw new Error('MONGODB_URI is not set. Add it to your .env file.');
  }

  await mongoose.connect(MONGODB_URI);
  console.log('Connected to MongoDB.');
}

module.exports = connectDB;
