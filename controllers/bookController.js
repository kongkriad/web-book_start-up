const Book = require('../models/Book');

exports.createBook = async (req, res) => {
try {
const count = await Book.countDocuments();
const bookCode = `BK-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

const book = await Book.create({
title: req.body.title,
bookCode,
coverImage: req.files.cover[0].path,
pdfFile: req.files.pdf[0].path
});

res.json(book);
} catch (err) {
res.status(500).json({ error: err.message });
}
};

exports.getBooks = async (req, res) => {
  const books = await Book.find().sort({ createdAt: -1 });
  res.json(books);
};

const cloudinary = require('../config/cloudinary');

exports.deleteBook = async (req, res) => {
  const book = await Book.findById(req.params.id);
  if (!book) return res.status(404).json({ message: 'Not found' });

  // ดึง public_id จาก URL
  const getPublicId = (url) =>
    url.split('/').pop().split('.')[0];

  await cloudinary.uploader.destroy(
    `books/covers/${getPublicId(book.coverImage)}`
  );

  await cloudinary.uploader.destroy(
    `books/pdf/${getPublicId(book.pdfFile)}`,
    { resource_type: 'raw' }
  );

  await Book.findByIdAndDelete(req.params.id);

  res.json({ message: 'Book deleted' });
};

