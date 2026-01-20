npm install express mongoose dotenv cors multer cloudinary multer-storage-cloudinary
npm install nodemon --save-dev
npm install bcryptjs
npm install express-session


```
web-book_start-up
├─ components
│  ├─ footer.html
│  └─ navbar.html
├─ config
│  ├─ cloudinary.js
│  └─ db.js
├─ controllers
│  ├─ authController.js
│  └─ bookController.js
├─ middleware
│  ├─ auth.js
│  └─ upload.js
├─ models
│  ├─ Book.js
│  └─ User.js
├─ package-lock.json
├─ package.json
├─ public
│  ├─ css
│  │  └─ style.css
│  ├─ index.html
│  ├─ js
│  │  ├─ layout.js
│  │  ├─ library.js
│  │  └─ main.js
│  ├─ library.html
│  ├─ login.html
│  └─ register.html
├─ README.md
├─ routes
│  ├─ authRoutes.js
│  └─ bookRoutes.js
└─ server.js

```