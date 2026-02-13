const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const SECRET = process.env.JWT_SECRET || 'secret-key-123';

const generateToken = (user) => {
  return jwt.sign(
    { id: user.user_id, email: user.email, role: user.role, location_id: user.location_id, department_id: user.department_id },
    SECRET,
    { expiresIn: '24h' }
  );
};

const verifyToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, SECRET, (err, decoded) => {
    if (err) return res.status(401).json({ message: 'Failed to authenticate token' });
    req.user = decoded;
    next();
  });
};

const checkRole = (roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Forbidden: Insufficient permissions' });
    }
    next();
  };
};

module.exports = { generateToken, verifyToken, checkRole };
