const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');
const { createBook } = require('../controllers/bookController');

router.post('/', upload.fields([
{ name: 'cover', maxCount: 1 },
{ name: 'pdf', maxCount: 1 }
]), createBook);

module.exports = router;