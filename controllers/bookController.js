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
