/* =====================================================
   ROLE BASED AUTH MIDDLEWARE
===================================================== */


/* ================= CHECK LOGIN ================= */
const isLoggedIn = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      message: 'Unauthorized. Please login.'
    });
  }
  next();
};


/* ================= ADMIN ONLY ================= */
const isAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.session.user.role !== 'Admin') {
    return res.status(403).json({ message: 'Admin only access' });
  }

  next();
};


/* ================= SUB-ADMIN ONLY ================= */
const isSubAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.session.user.role !== 'Sub Admin') {
    return res.status(403).json({ message: 'Sub Admin only access' });
  }

  next();
};


/* ================= ADMIN OR SUB-ADMIN ================= */
const isAdminOrSubAdmin = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const role = req.session.user.role;

  if (role !== 'Admin' && role !== 'Sub Admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  next();
};


/* ================= GENERIC ROLE CHECKER =================
   Flexible usage:
   allowRoles('Admin')
   allowRoles('Admin','Sub Admin')
   allowRoles('Staff','Trainer')
===================================================== */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.session || !req.session.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const role = req.session.user.role;

    if (!roles.includes(role)) {
      return res.status(403).json({
        message: `Access denied. Allowed roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};


/* ================= FINANCE ONLY ================= */
const isFinance = (req, res, next) => {
  if (!req.session || !req.session.user) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  if (req.session.user.role !== 'Finance') {
    return res.status(403).json({ message: 'Finance only access' });
  }

  next();
};


/* ================= EXPORTS ================= */
module.exports = {
  isLoggedIn,
  isAdmin,
  isSubAdmin,
  isAdminOrSubAdmin,
  allowRoles,
  isFinance
};
