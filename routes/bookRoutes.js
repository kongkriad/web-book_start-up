const express = require("express");
const router = express.Router();

const {
  createBook,
  getBooks,
  deleteBook,
  updateBook,        // ⭐ เพิ่ม
  getBookById,       // ⭐ เพิ่ม
  getDashboardData
} = require("../controllers/bookController");

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
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
  createBook   // ✅ ไม่ใช้ bookController.
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
  updateBook   // ✅
);


/* =========================
   📊 DASHBOARD
========================= */
router.get("/dashboard", auth, getDashboardData);


/* =========================
   📚 GET ALL BOOKS
========================= */
router.get("/", auth, getBooks);


/* =========================
   📘 GET BOOK BY ID
========================= */
router.get("/:id", auth, getBookById);


/* =========================
   ❌ DELETE BOOK
========================= */
router.delete("/:id", auth, deleteBook);


/* =========================
   🔑 BOOK CODE ROUTES
========================= */
router.get("/BookCode", auth, async (req, res) => {
  const codes = await Code.find().sort({ createdAt: -1 });
  res.json(codes);
});

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
