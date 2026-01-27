const Book = require("../models/Book");
const BookCode = require("../models/BookCode");
const cloudinary = require("../config/cloudinary");
const QRCode = require("qrcode");

/* =========================
   ➕ CREATE BOOK
========================= */
exports.createBook = async (req, res) => {
  try {
    // 🔐 check session
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    // ✅ validate detail
    if (!req.body.detail || !req.body.detail.trim()) {
      return res.status(400).json({ message: "Detail is required" });
    }

    // ✅ validate pdf
    if (!req.files?.pdf || req.files.pdf.length === 0) {
      return res.status(400).json({ message: "PDF file is missing" });
    }

    // 🔢 generate bookCode
    const lastBook = await Book.findOne({ bookCode: { $exists: true } })
      .sort({ createdAt: -1 })
      .select("bookCode");

    let nextNumber = 1;
    if (lastBook?.bookCode) {
      const lastNumber = parseInt(lastBook.bookCode.split("-")[1], 10);
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

    const bookCode = `BK-${String(nextNumber).padStart(4, "0")}`;

    // 🖼 cover (optional)
    const coverImage = req.files.cover?.length
      ? {
          url: req.files.cover[0].path,
          public_id: req.files.cover[0].filename,
        }
      : undefined;

    // 📘 create book
    const book = await Book.create({
      title: req.body.title?.trim(),
      detail: req.body.detail.trim(),
      bookCode,
      coverImage,
      pdfFile: {
        url: req.files.pdf[0].path,
        public_id: req.files.pdf[0].filename,
      },
      addedBy: req.session.user.id,
    });

    return res.status(201).json({
      message: "Book created successfully",
      book,
    });

  } catch (err) {
    console.error("CREATE BOOK ERROR:", err);

    if (err.code === 11000) {
      return res.status(409).json({ message: "Book code already exists" });
    }

    return res.status(500).json({ message: "Internal server error" });
  }
};


/* =========================
   📚 GET ALL BOOKS
========================= */
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({})
      .populate("addedBy", "email")
      .sort({ createdAt: -1 })
      .lean();

    res.json(books);
  } catch (err) {
    console.error("GET BOOKS ERROR:", err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};


/* =========================
   📘 GET BOOK BY ID
========================= */
exports.getBookById = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    res.json(book);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};


/* =========================
   ✏️ UPDATE BOOK
========================= */
exports.updateBook = async (req, res) => {
  try {
    const id = req.params.id;

    if (!req.body.detail || !req.body.detail.trim()) {
      return res.status(400).json({ message: "Detail is required" });
    }

    const updateData = {
      title: req.body.title?.trim(),
      detail: req.body.detail.trim(),
    };

    if (req.files?.cover?.length) {
      updateData.coverImage = {
        url: req.files.cover[0].path,
        public_id: req.files.cover[0].filename,
      };
    }

    if (req.files?.pdf?.length) {
      updateData.pdfFile = {
        url: req.files.pdf[0].path,
        public_id: req.files.pdf[0].filename,
      };
    }

    const book = await Book.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // 🔁 sync title in BookCode
    await BookCode.updateMany(
      { bookId: id },
      { $set: { bookTitle: updateData.title } }
    );

    res.json(book);

  } catch (err) {
    console.error("UPDATE BOOK ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};


/* =========================
   ❌ DELETE BOOK
========================= */
exports.deleteBook = async (req, res) => {
  try {
    const book = await Book.findById(req.params.id);

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    await book.deleteOne();
    res.json({ message: "Book deleted successfully" });

  } catch (err) {
    console.error("DELETE BOOK ERROR:", err);
    res.status(500).json({ message: "Failed to delete book" });
  }
};


/* =========================
   🔑 GET BOOK CODES
========================= */
exports.getBookCodes = async (req, res) => {
  try {
    const codes = await BookCode.find()
      .sort({ createdAt: -1 })
      .lean();

    res.json(codes);
  } catch (err) {
    console.error("GET BOOK CODES ERROR:", err);
    res.status(500).json({ message: "Load codes failed" });
  }
};


/* =========================
   🔑 CREATE BOOK CODE
========================= */
exports.createBookCode = async (req, res) => {
  try {
    const { bookId, bookTitle } = req.body;

    if (!bookId || !bookTitle) {
      return res.status(400).json({ message: "ข้อมูลไม่ครบ" });
    }

    const code = Math.random()
      .toString(36)
      .substring(2, 8)
      .toUpperCase();

    await BookCode.create({
      code,
      bookId,
      bookTitle,
      used: false,
    });

    res.json({ message: "สร้างรหัสสำเร็จ" });
  } catch (err) {
    console.error("CREATE CODE ERROR:", err);
    res.status(500).json({ message: "Create code failed" });
  }
};


/* =========================
   🔳 GENERATE QR CODE
========================= */
exports.generateQRCode = async (req, res) => {
  try {
    const { codeId } = req.params;

    const bookCode = await BookCode.findById(codeId);
    if (!bookCode) {
      return res.status(404).json({ message: "Code not found" });
    }

    const qrBuffer = await QRCode.toBuffer(bookCode.code, {
      width: 300,
      margin: 2,
    });

    const uploadResult = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(
        { folder: "book-qrcode" },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      ).end(qrBuffer);
    });

    bookCode.qrImage = {
      url: uploadResult.secure_url,
      public_id: uploadResult.public_id,
    };

    await bookCode.save();

    const updatedCode = await BookCode.findById(codeId).lean();
    res.json(updatedCode);

  } catch (err) {
    console.error("GENERATE QR ERROR:", err);
    res.status(500).json({ message: "Generate QR failed" });
  }
};


/* =========================
   📊 DASHBOARD DATA
========================= */
exports.getDashboardData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.user.id;

    const totalBooks = await Book.countDocuments();
    const myBooks = await Book.countDocuments({ addedBy: userId });

    const history = await Book.find({ addedBy: userId })
      .populate("addedBy", "email")
      .sort({ createdAt: -1 })
      .limit(5)
      .select("title createdAt");

    res.json({
      totalBooks,
      myBooks,
      history,
    });

  } catch (err) {
    console.error("DASHBOARD ERROR:", err);
    res.status(500).json({ message: err.message });
  }
};