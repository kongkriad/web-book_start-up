require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const path = require("path");

const connectDB = require("./config/db");
const auth = require("./middleware/auth");

const authRoutes = require("./routes/authRoutes");
const bookRoutes = require("./routes/bookRoutes");

const app = express();

/* CONNECT DATABASE */
connectDB();

/* CORS */
app.use(
  cors({
    origin: "http://localhost:2000",
    credentials: true
  })
);

/* BODY PARSER */
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/* SESSION (MongoDB) */
app.use(
  session({
    name: "connect.sid",
    secret: "admin-secret-key",
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
      mongoUrl: process.env.MONGO_URI,
      collectionName: "sessions",
      ttl: 14 * 24 * 60 * 60
    }),
    cookie: {
      httpOnly: true,
      secure: false, // true เมื่อ deploy https
      sameSite: "lax"
    }
  })
);


/* STATIC FILES */
app.use(express.static(path.join(__dirname, "public"), { index: false }));
app.use("/components", express.static(path.join(__dirname, "components")));

/* API ROUTES */
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

app.get("/createCode", auth, (req, res) => {
  res.sendFile(path.join(__dirname, "public", "createCode.html"));
});


/* START SERVER */
app.listen(2000, () => {
  console.log("🚀 Server running at http://localhost:2000");
});
