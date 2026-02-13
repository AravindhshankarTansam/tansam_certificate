const crypto = require('crypto');

exports.generateAccessToken = () =>
  crypto.randomBytes(32).toString('hex');
