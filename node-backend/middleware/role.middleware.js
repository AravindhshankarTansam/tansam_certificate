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

  if (req.session.user.role !== 'Sub Admin')
    return res.status(403).json({ message: 'Access denied (Sub Admin only)' });

  next();
};

/* ================= ADMIN OR SUB-ADMIN ================= */

exports.isAdminOrSubAdmin = (req, res, next) => {

  if (!req.session.user)
    return res.status(401).json({ message: 'Unauthorized' });

  const role = req.session.user.role;

  if (role !== 'Admin' && role !== 'Sub Admin')
    return res.status(403).json({ message: 'Access denied' });

  next();
};
