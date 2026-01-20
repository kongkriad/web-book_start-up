const Book = require('../models/Book');

exports.createBook = async (req, res) => {
  const count = await Book.countDocuments();
  const bookCode = `BK-${new Date().getFullYear()}-${String(count + 1).padStart(4, '0')}`;

  const book = await Book.create({
    title: req.body.title,
    bookCode
  });

  res.json(book);
};
