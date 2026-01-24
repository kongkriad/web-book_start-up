const express = require("express");
const router = express.Router();

/* =========================
 CONTROLLERS
========================= */
const {
  createBook,
  getBooks,
  getBookById,
  updateBook,
  deleteBook,
  getDashboardData,
  getBookCodes,
  createBookCode
} = require("../controllers/bookController");

/* =========================
 MIDDLEWARE
========================= */
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

/* =========================
 🔑 BOOK CODE ROUTES (ต้องอยู่บนสุด)
========================= */
router.get("/bookcodes", auth, getBookCodes);

router.post("/createcode", auth, createBookCode);

/* =========================
 📊 DASHBOARD
========================= */
router.get("/dashboard", auth, getDashboardData);

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
  createBook
);

/* =========================
 📚 GET ALL BOOKS
========================= */
router.get("/", auth, getBooks);

/* =========================
 📘 GET BOOK BY ID
========================= */
router.get("/:id", auth, getBookById);

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
  updateBook
);

/* =========================
 ❌ DELETE BOOK
========================= */
router.delete("/:id", auth, deleteBook);

module.exports = router;
