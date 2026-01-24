/* ================= ADMIN ONLY ================= */
exports.isAdmin = (req, res, next) => {

  if (req.session.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only access' });
  }

  next();
};

/* ================= SUB-ADMIN ONLY ================= */

exports.isSubAdmin = (req, res, next) => {

  if (!req.session.user)
    return res.status(401).json({ message: 'Unauthorized' });

  if (req.session.user.role !== 'Sub admin')
    return res.status(403).json({ message: 'Access denied (Sub Admin only)' });

  next();
};
