const mongoose = require('mongoose');

const BookSchema = new mongoose.Schema({
  title: String,
  bookCode: { type: String, unique: true },
  coverImage: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Book', BookSchema);
