const jwt = require('jsonwebtoken');

module.exports = function (req, res, next) {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({
    code: 401,
    status: "fail",
    message: "Access denied. No token provided.",
    data: null
  });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({
      code: 403,
      status: "fail",
      message: "Invalid token.",
      data: null
    });
  }
};
