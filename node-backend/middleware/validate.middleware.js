exports.validateLab = (req, res, next) => {

  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({
      message: 'Lab name required'
    });
  }

  next();
};
