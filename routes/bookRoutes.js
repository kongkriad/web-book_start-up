const express = require("express");
const router = express.Router();

const {
  createBook,
  getBooks,
  deleteBook,
  getDashboardData
} = require("../controllers/bookController");

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const Book = require("../models/Book");
const Code = require("../models/BookCode");

// ➕ Add book (ต้อง login)
router.post(
  "/",
  auth, // 🔥 สำคัญมาก
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "pdf", maxCount: 1 }
  ]),
  createBook
);

// 📊 Dashboard
router.get("/dashboard", auth, getDashboardData);

// 📚 Get all books (ต้อง login)
router.get("/", auth, getBooks);

// ❌ Delete book (ต้อง login)
router.delete("/:id", auth, deleteBook);

// 🔑 ดึงรหัสทั้งหมด
router.get("/BookCode", auth, async (req, res) => {
  const codes = await Code.find().sort({ createdAt: -1 });
  res.json(codes);
});

// ➕ สร้างรหัส
router.post("/createCode", auth, async (req, res) => {
  const { bookId, bookTitle } = req.body;

  const code = Math.random().toString(36).substring(2, 8).toUpperCase();

  await Code.create({
    code,
    bookId,
    bookTitle,
    used: false
  });

  res.json({ message: "สร้างรหัสสำเร็จ" });
});
module.exports = router;
