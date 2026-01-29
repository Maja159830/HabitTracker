const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }
    
    const token = authHeader.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ 
        success: false, 
        message: 'No token, authorization denied' 
      });
    }
    
    try {
      // sprawdzenie tokenu
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'secret');
      req.userId = decoded.userId;
      req.user = decoded;
      next();
    } catch (error) {
      console.error('Token verification error:', error.message);
      return res.status(401).json({ 
        success: false, 
        message: 'Token is not valid' 
      });
    }
    
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({ 
      success: false, 
      message: 'Authentication error' 
    });
  }
};

module.exports = authMiddleware;