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


/* =========================
   ➕ CREATE BOOK
========================= */
router.post(
  "/",
  auth,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "pdf", maxCount: 1 }
  ]),
  bookController.createBook
);


/* =========================
   ✏️ UPDATE BOOK
========================= */
router.put(
  "/:id",
  auth,
  upload.fields([
    { name: "cover", maxCount: 1 },
    { name: "pdf", maxCount: 1 }
  ]),
  bookController.updateBook
);


/* =========================
   📊 DASHBOARD
========================= */
router.get("/dashboard", auth, bookController.getDashboardData);


/* =========================
   📚 GET ALL BOOKS
========================= */
router.get("/", auth, bookController.getBooks);


/* =========================
   📘 GET BOOK BY ID ⭐ (สำคัญ)
========================= */
router.get("/:id", auth, bookController.getBookById);


/* =========================
   ❌ DELETE BOOK
========================= */
router.delete("/:id", auth, bookController.deleteBook);

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
