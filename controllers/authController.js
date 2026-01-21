const User = require("../models/User");
const bcrypt = require("bcryptjs");

/* =====================
   REGISTER
===================== */
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        message: "Email already exists"
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await User.create({
      email,
      password: hashedPassword
    });

    res.status(201).json({
      message: "Register success"
    });

  } catch (err) {
    console.error("REGISTER ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

/* =====================
   LOGIN (SESSION)
===================== */
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required"
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid email or password"
      });
    }

    // 🔥 SET SESSION
    req.session.user = {
      id: user._id,
      email: user.email
    };

    res.json({
      message: "Login success",
      user: {
        id: user._id,
        email: user.email
      }
    });

  } catch (err) {
    console.error("LOGIN ERROR:", err);
    res.status(500).json({
      message: "Server error"
    });
  }
};

/* =====================
   LOGOUT
===================== */
exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error("LOGOUT ERROR:", err);
      return res.status(500).json({
        message: "Logout failed"
      });
    }

    res.clearCookie("connect.sid", { path: "/" });

    res.json({
      message: "Logout success"
    });
  });
};

/* =====================
   CHECK AUTH (OPTIONAL)
===================== */
exports.me = (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: "Unauthorized"
    });
  }

  res.json({
    user: req.session.user
  });
};
