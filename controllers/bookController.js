const Book = require("../models/Book");
const cloudinary = require("../config/cloudinary");

/**
 * ➕ Create Book
 * (ต้อง login ก่อน)
 */
exports.createBook = async (req, res) => {
  try {
    // 🔐 ต้อง login
    if (!req.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // 🔐 validate file
    if (!req.files?.cover || !req.files?.pdf) {
      return res.status(400).json({
        message: "Cover image or PDF file is missing"
      });
    }

    // 🔢 generate bookCode
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
      addedBy: req.user._id, // 🔥 สำคัญ
    });

    res.status(201).json({
      message: "Book created successfully",
      book,
    });

  } catch (err) {
    console.error("CREATE BOOK ERROR:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Book code already exists"
      });
    }

    res.status(500).json({
      message: "Internal server error"
    });
  }
};

/**
 * 📚 Get All Books
 */
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({})
      .sort({ createdAt: -1 })
      .lean(); // ⭐ สำคัญ

    res.json(books);
  } catch (err) {
    console.error("GET BOOKS ERROR 👉", err); // ⭐ ดูตรงนี้ใน terminal
    res.status(500).json({ message: "Failed to fetch books" });
  }
};


/**
 * ❌ Delete Book
 * (ลบ Cloudinary ด้วย)
 */
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);
    if (!book) {
      return res.status(404).json({
        message: "Book not found"
      });
    }

    // 🖼️ delete cover
    if (book.coverImage?.public_id) {
      await cloudinary.uploader.destroy(book.coverImage.public_id);
    }

    // 📄 delete pdf (raw)
    if (book.pdfFile?.public_id) {
      await cloudinary.uploader.destroy(
        book.pdfFile.public_id,
        { resource_type: "raw" }
      );
    }

    await book.deleteOne();

    res.json({
      message: "Book deleted successfully"
    });

  } catch (err) {
    console.error("DELETE BOOK ERROR:", err);
    res.status(500).json({
      message: "Failed to delete book"
    });
  }
};

/**
 * 📊 Dashboard Data
 */
exports.getDashboardData = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized"
      });
    }

    const userId = req.user._id;

    const totalBooks = await Book.countDocuments();
    const myBooks = await Book.countDocuments({ addedBy: userId });

    const history = await Book.find({ addedBy: userId })
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");

    res.json({
      totalBooks,
      myBooks,
      history
    });

  } catch (err) {
    res.status(500).json({
      message: err.message
    });
  }
};
