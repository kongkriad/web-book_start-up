const User = require('../models/User');
const bcrypt = require('bcryptjs');

/* ===== REGISTER ===== */
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: 'Email already exists' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      email,
      password: hashedPassword
    });

    res.json({ message: 'Register success' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/* ===== LOGIN ===== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid email or password" });
    }

    // ✅ set session ให้ชัดเจน
    req.session.user = {
      id: user._id,
      email: user.email
    };

    res.json({ message: "Login success" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   const user = await User.findOne({ email });
//   if (!user) {
//     return res.status(400).json({ message: 'Invalid email or password' });
//   }

//   const isMatch = await bcrypt.compare(password, user.password);
//   if (!isMatch) {
//     return res.status(400).json({ message: 'Invalid email or password' });
//   }

//   req.session.user = {
//     id: user._id,
//     email: user.email
//   };

//   res.json({ message: 'Login success' });
// };

/* ===== LOGOUT ===== */
exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ message: "Logout failed" });
    }

    res.clearCookie("connect.sid", { path: "/" });
    res.status(200).json({ message: "Logout success" });
  });
};

