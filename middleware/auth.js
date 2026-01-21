module.exports = (req, res, next) => {
  if (!req.session.user) {
    // ถ้าเป็นการเปิดหน้าเว็บ → redirect
    if (req.headers.accept && req.headers.accept.includes("text/html")) {
      return res.redirect("/login.html");
    }

    // ถ้าเป็น API → 401 JSON
    return res.status(401).json({ message: "Not authorized" });
  }

  req.user = req.session.user;
  next();
};
