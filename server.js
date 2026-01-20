require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');
const session = require('express-session');
const auth = require('./middleware/auth');
const app = express();
connectDB();

app.use(session({
  secret: 'admin-secret-key',
  resave: false,
  saveUninitialized: false
}));

app.get('/', auth, (req, res) => {
  res.sendFile(__dirname + '/public/index.html');
});

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use("/components", express.static("components"))


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/books', require('./routes/bookRoutes'));

app.listen(2000, () => console.log("Server running on port http://localhost:2000"));
