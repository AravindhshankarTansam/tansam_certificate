/* =====================================================
   ROLE BASED AUTH MIDDLEWARE (CLEAN VERSION)
===================================================== */


/* ================= CHECK LOGIN ================= */
const isLoggedIn = (req, res, next) => {
  if (!req.session?.user) {
    return res.status(401).json({ message: 'Unauthorized. Please login.' });
  }
  next();
};


/* =====================================================
   GENERIC ROLE CHECKER (MAIN ONE YOU NEED)
   Usage:
   allowRoles('admin')
   allowRoles('admin','sub admin')
   allowRoles('team lead')
===================================================== */
const allowRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.session?.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    // 🔥 normalize once
    const role = req.session.user.role.toLowerCase().trim();

    const allowed = roles.map(r => r.toLowerCase());

    if (!allowed.includes(role)) {
      return res.status(403).json({
        message: `Access denied. Allowed roles: ${roles.join(', ')}`
      });
    }

    next();
  };
};


/* =====================================================
   SIMPLE SHORTCUTS (optional helpers)
===================================================== */
const isAdmin = allowRoles('admin');
const isSubAdmin = allowRoles('sub admin');
const isAdminOrSubAdmin = allowRoles('admin', 'sub admin');
const isFinance = allowRoles('finance');
const isTeamLead = allowRoles('team lead');


/* ================= EXPORTS ================= */
module.exports = {
  isLoggedIn,
  allowRoles,
  isAdmin,
  isSubAdmin,
  isAdminOrSubAdmin,
  isFinance,
  isTeamLead
};
