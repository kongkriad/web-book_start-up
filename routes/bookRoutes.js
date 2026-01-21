const express = require('express');
const router = express.Router();
const { getDashboardData } = require("../controllers/bookController");
const auth = require("../middleware/auth");
const {
  createBook,
  getBooks,
  deleteBook
} = require('../controllers/bookController');

const upload = require('../middleware/upload');

router.post(
  '/',
  upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'pdf', maxCount: 1 }
  ]),
  createBook
);

router.get("/dashboard", auth, getDashboardData);
router.get('/', getBooks);
router.delete('/:id', deleteBook);

module.exports = router;
