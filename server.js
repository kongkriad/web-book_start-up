require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const path = require("path");

const connectDB = require("./config/db");
const auth = require("./middleware/auth");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");

const app = express();

/* =======================
   CONNECT DATABASE
======================= */
connectDB();

/* =======================
   CORS (ต้องมาก่อน session)
======================= */
app.use(
  cors({
    origin: "http://localhost:2000",
    credentials: true
  })
);

/* =======================
   BODY PARSER
======================= */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* =======================
   SESSION
======================= */
app.use(
  session({
    name: "connect.sid",
    secret: "admin-secret-key",
    resave: false,
    saveUninitialized: false,
    cookie: {
      httpOnly: true,
      secure: false,     // localhost = false
      sameSite: "lax"
    }
  })
);

/* =======================
   STATIC FILES
======================= */
app.use(
  express.static(path.join(__dirname, "public"), {
    index: false
  })
);

/* components */
app.use("/components", express.static(path.join(__dirname, "components")));

/* =======================
   API ROUTES
======================= */
app.use("/api/auth", authRoutes);
app.use("/api/books", bookRoutes);

/* =======================
   PROTECTED PAGES
======================= */
app.get("/", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.get("/library", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "library.html"));
});

app.get("/addbook", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "addbook.html"));
});

/* =======================
   START SERVER
======================= */
app.listen(2000, () => {
  console.log("🚀 Server running at http://localhost:2000");
});
