import jwt from 'jsonwebtoken';

/**
 * ✅ UNIFIED: Generate JWT token for ALL users (admin/worker/client)
 * @param {String} userId - User/Client ID
 * @param {String} role - 'admin' | 'worker' | 'client'
 * @returns {String} JWT token
 */
export const generateToken = (userId, role) => {
  const expiresIn = role === 'client' 
    ? (process.env.JWT_CLIENT_EXPIRE || '24h')  // Clients get 24h
    : (process.env.JWT_EXPIRE || '7d');         // Staff get 7d

  return jwt.sign(
    { 
      id: userId, 
      role,
      type: 'user' // Unified type
    },
    process.env.JWT_SECRET,
    { expiresIn }
  );
};

/**
 * ⚠️ DEPRECATED: Use generateToken() instead
 * Kept for backward compatibility only
 */
export const generateClientToken = (clientId, taskId) => {
  console.warn('⚠️ generateClientToken is deprecated. Use generateToken(clientId, "client") instead.');
  return jwt.sign(
    { clientId, taskId, type: 'client' },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_CLIENT_EXPIRE || '24h' }
  );
};

/**
 * Verify JWT token
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
};

/**
 * Decode JWT token without verification (for debugging)
 * @param {String} token - JWT token
 * @returns {Object} Decoded token payload
 */
export const decodeToken = (token) => {
  return jwt.decode(token);
};