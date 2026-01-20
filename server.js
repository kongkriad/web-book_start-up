require('dotenv').config();
const express = require('express');
const cors = require('cors');
const connectDB = require('./config/db');

const app = express();
connectDB();

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

app.use('/api/books', require('./routes/bookRoutes'));

app.listen(5000, () => console.log("Server running on port http://localhost:5000"));
