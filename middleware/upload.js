const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('../config/cloudinary');


const storage = new CloudinaryStorage({
cloudinary,
params: (req, file) => {
if (file.mimetype === 'application/pdf') {
return { folder: 'books/pdf', resource_type: 'raw' };
}
return { folder: 'books/covers' };
}
});


module.exports = multer({ storage });