require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const session = require('express-session');
const auth = require('./middleware/auth');

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");

const app = express();

connectDB();

/* 🔥 CORS (ต้องมาก่อน session) */
app.use(cors({
  origin: "http://localhost:2000",
  credentials: true
}));

/* body parser */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* 🔥 SESSION */
app.use(session({
  name: "connect.sid",
  secret: "admin-secret-key",
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false,      // localhost
    sameSite: "lax"
  }
}));

/* 🔥 Static (ปิด index.html อัตโนมัติ) */
app.use(express.static('public', {
  index: false
}));

/* components */
app.use("/components", express.static("components"));

/* routes */
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

/* 🔒 Protected page */
app.get('/', auth, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.listen(2000, () => {
  console.log("Server running at http://localhost:2000");
});
