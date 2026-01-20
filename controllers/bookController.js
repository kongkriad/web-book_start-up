const Book = require("../models/Book");
const cloudinary = require("../config/cloudinary");

exports.createBook = async (req, res) => {
  try {
    // 🔐 validate file
    if (!req.files?.cover || !req.files?.pdf) {
      return res.status(400).json({ message: "Cover image or PDF file is missing" });
    }

    // 🔢 generate bookCode แบบปลอดภัย
    const lastBook = await Book.findOne({ bookCode: { $exists: true } })
      .sort({ createdAt: -1 })
      .select("bookCode");

    let nextNumber = 1;
    if (lastBook?.bookCode) {
      const lastNumber = parseInt(lastBook.bookCode.split("-")[1], 10);
      if (!isNaN(lastNumber)) {
        nextNumber = lastNumber + 1;
      }
    }

    const bookCode = `BK-${String(nextNumber).padStart(4, "0")}`;

    // 📦 create book
    const book = await Book.create({
      title: req.body.title?.trim(),
      bookCode,
      coverImage: {
        url: req.files.cover[0].path,
        public_id: req.files.cover[0].filename,
      },
      pdfFile: {
        url: req.files.pdf[0].path,
        public_id: req.files.pdf[0].filename,
      },
    });

    res.status(201).json({
      message: "Book Created",
      bookCode: book.bookCode,
      book,
    });
  } catch (err) {
    console.error("CREATE BOOK ERROR:", err);

    // 🚫 duplicate key
    if (err.code === 11000) {
      return res.status(409).json({
        message: "Book code already exists",
      });
    }

    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find().sort({ createdAt: -1 });
    res.json(books);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch books" });
  }
};

exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // 🖼️ delete cover image
    if (book.coverImage?.public_id) {
      await cloudinary.uploader.destroy(book.coverImage.public_id);
    }

    // 📄 delete PDF (raw)
    if (book.pdfFile?.public_id) {
      await cloudinary.uploader.destroy(book.pdfFile.public_id, {
        resource_type: "raw",
      });
    }

    await book.deleteOne();

    res.json({ message: "Book deleted completely" });
  } catch (err) {
    console.error("DELETE BOOK ERROR:", err);
    res.status(500).json({ message: "Failed to delete book" });
  }
};
