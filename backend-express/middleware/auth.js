// Import jwt
const jwt = require("jsonwebtoken");

const verifyToken = (req, res, next) => {
  // Get token: "Bearer <token>" or the bare token (the frontend sends it without prefix)
  const header = req.headers["authorization"];
  if (!header) return res.status(401).json({ message: "Unauthenticated." });
  const token = header.startsWith("Bearer ") ? header.slice(7) : header;

  // Verify token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: "Invalid token" });
    req.userId = decoded.id;
    next();
  });
};

module.exports = verifyToken;
