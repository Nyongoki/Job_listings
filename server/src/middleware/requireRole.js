const jwt = require('jsonwebtoken');

function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authorization token required' });
    }

    const token = authHeader.split(' ')[1];
    try {
      const jwtSecret = process.env.JWT_SECRET || 'your_jwt_secret_here_min_32_chars';
      const decoded = jwt.verify(token, jwtSecret);
      
      // Attach details to request object
      req.user = {
        userId: decoded.userId,
        role: decoded.role
      };

      // Check role permissions if restricted roles are specified
      if (allowedRoles.length > 0 && !allowedRoles.includes(req.user.role)) {
        return res.status(403).json({ error: 'Access forbidden: insufficient permissions' });
      }

      next();
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired authorization token' });
    }
  };
}

module.exports = requireRole;
