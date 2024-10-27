// middlewares/authMiddleware.js
import admin from '../config/firebaseAdmin.js';

export const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({ message: 'Unauthorized, no token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    req.user = decodedToken; // Attach user data to the request object
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Unauthorized, invalid token' });
  }
};
