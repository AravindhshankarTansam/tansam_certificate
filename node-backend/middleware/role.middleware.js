/* ================= ADMIN ONLY ================= */
exports.isAdmin = (req, res, next) => {

  if (req.session.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only access' });
  }

  next();
};
