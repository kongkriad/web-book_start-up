const Book = require("../models/Book");
const BookCode = require("../models/BookCode");
const cloudinary = require("../config/cloudinary");
const QRCode = require("qrcode");

/**
 * ➕ Create Book
 * (ต้อง login ก่อน — ใช้ session)
 */
exports.createBook = async (req, res) => {
  try {
    // 🔐 check session
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (!req.files?.pdf) {
      return res.status(400).json({ message: "PDF file is missing" });
    }

    const lastBook = await Book.findOne({ bookCode: { $exists: true } })
      .sort({ createdAt: -1 })
      .select("bookCode");

    let nextNumber = 1;
    if (lastBook?.bookCode) {
      const lastNumber = parseInt(lastBook.bookCode.split("-")[1], 10);
      if (!isNaN(lastNumber)) nextNumber = lastNumber + 1;
    }

    const bookCode = `BK-${String(nextNumber).padStart(4, "0")}`;

    const coverImage = req.files?.cover
      ? {
          url: req.files.cover[0].path,
          public_id: req.files.cover[0].filename,
        }
      : undefined; // ❗ ปล่อยให้ schema ใส่ default เอง

    const book = await Book.create({
      title: req.body.title?.trim(),
      bookCode,
      coverImage,
      pdfFile: {
        url: req.files.pdf[0].path,
        public_id: req.files.pdf[0].filename,
      },
      addedBy: req.session.user.id,
    });

    res.status(201).json({
      message: "Book created successfully",
      book,
    });
  } catch (err) {
    console.error("CREATE BOOK ERROR:", err);

    if (err.code === 11000) {
      return res.status(409).json({
        message: "Book code already exists",
      });
    }

    res.status(500).json({
      message: "Internal server error",
    });
  }
};

/**
 * 📚 Get All Books
 */
exports.getBooks = async (req, res) => {
  try {
    const books = await Book.find({})
      .populate("addedBy", "email") // 🔥 แสดง email คนเพิ่ม
      .sort({ createdAt: -1 })
      .lean();

    res.json(books);
  } catch (err) {
    console.error("GET BOOKS ERROR 👉", err);
    res.status(500).json({ message: "Failed to fetch books" });
  }
};


/* =========================
   📘 GET BOOK BY ID ⭐
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
   ✏️ UPDATE BOOK ⭐
========================= */
exports.updateBook = async (req, res) => {
  try {
    const { title, coverImage, pdfFile } = req.body;
    const id = req.params.id;

    const updateData = { title };

    if (coverImage) updateData.coverImage = coverImage;
    if (pdfFile) updateData.pdfFile = pdfFile;

    // 🔁 update book
    const book = await Book.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }

    // 🔁 sync book title in BookCode
    await BookCode.updateMany(
      { bookId: id },
      { $set: { bookTitle: title } }
    );

    res.json(book);

  } catch (err) {
    console.error("Update book error:", err);
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
      used: false
    });

    res.json({ message: "สร้างรหัสสำเร็จ" });
  } catch (err) {
    console.error("CREATE CODE ERROR:", err);
    res.status(500).json({ message: "Create code failed" });
  }
};

// exports.generateQRCode = async (req, res) => {
//   try {
//     const { codeId } = req.params;

//     const bookCode = await BookCode.findById(codeId);
//     if (!bookCode) {
//       return res.status(404).json({ message: "Code not found" });
//     }

//     // 🧾 ข้อมูลใน QR
//     const qrText = bookCode.code;

//     // 🔁 สร้าง QR เป็น buffer
//     const qrBuffer = await QRCode.toBuffer(qrText, {
//       width: 300,
//       margin: 2,
//     });

//     // ☁️ upload cloudinary (stream)
//     const uploadResult = await new Promise((resolve, reject) => {
//       cloudinary.uploader.upload_stream(
//         {
//           folder: "book-qrcode",
//         },
//         (error, result) => {
//           if (error) reject(error);
//           else resolve(result);
//         }
//       ).end(qrBuffer);
//     });

//     // 💾 save ลง DB
//     bookCode.qrImage = {
//       url: uploadResult.secure_url,
//       public_id: uploadResult.public_id,
//     };
//     await bookCode.save();

//     res.json({
//       message: "QR Code created",
//       qrUrl: uploadResult.secure_url,
//     });
//   } catch (err) {
//     console.error(err);
//     res.status(500).json({ message: "Generate QR failed" });
//   }
// };
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

    // 🔥 ดึงใหม่จาก DB ให้ข้อมูลครบ
    const updatedCode = await BookCode.findById(codeId).lean();

    res.json(updatedCode);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Generate QR failed" });
  }
};


/**
 * 📊 Dashboard Data
 */
exports.getDashboardData = async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const userId = req.session.user.id;

    const totalBooks = await Book.countDocuments();
    const myBooks = await Book.countDocuments({ addedBy: userId });

    // 🕒 history (เฉพาะของตัวเอง)
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

// exports.createQRCode = async (req, res) => {
//   const code = await BookCode.findById(req.params.id);

//   // generate QR + upload cloudinary
//   code.qrImage = {
//     url: uploaded.url,
//     public_id: uploaded.public_id
//   };

//   await code.save();
//   res.json(code);
// };

