const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../db');

const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_here_min_32_chars';
const REFRESH_SECRET = process.env.REFRESH_SECRET || 'your_refresh_secret_here_min_32_chars';

async function register(req, res) {
  const { name, email, phone, password, role } = req.body;

  try {
    // 1. Hash password with bcrypt (strength 12)
    const passwordHash = await bcrypt.hash(password, 12);

    // 2. Insert user into DB
    const insertQuery = db.prepare(`
      INSERT INTO users (name, email, phone, password_hash, role)
      VALUES (?, ?, ?, ?, ?)
    `);

    const result = insertQuery.run(name, email, phone, passwordHash, role);
    const userId = result.lastInsertRowid;

    // 3. Fetch newly created user object (excluding password_hash)
    const user = db.prepare(`
      SELECT user_id, name, email, phone, role, created_at
      FROM users WHERE user_id = ?
    `).get(userId);

    return res.status(201).json({
      message: "Registration successful",
      user: {
        user_id: user.user_id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        created_at: new Date(user.created_at + 'Z').toISOString() // format to standard ISO UTC
      }
    });
  } catch (err) {
    // Check for SQLite UNIQUE constraint violation on email
    if (err.code === 'SQLITE_CONSTRAINT' || err.message.includes('UNIQUE constraint failed')) {
      return res.status(409).json({ error: "An account with this email already exists" });
    }
    console.error('Registration error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

async function login(req, res) {
  const { email, password } = req.body;

  try {
    // 1. Look up user by email
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email);
    if (!user) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 2. Compare passwords
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // 3. Generate tokens
    const accessToken = jwt.sign(
      { userId: user.user_id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    const refreshToken = jwt.sign(
      { userId: user.user_id },
      REFRESH_SECRET,
      { expiresIn: '7d' }
    );

    // 4. Save refresh token to DB with 7-day expiration
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
    db.prepare(`
      INSERT INTO refresh_tokens (user_id, token, expires_at)
      VALUES (?, ?, ?)
    `).run(user.user_id, refreshToken, expiresAt);

    return res.status(200).json({
      accessToken,
      refreshToken,
      user: {
        user_id: user.user_id,
        name: user.name,
        role: user.role
      }
    });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

function refresh(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) {
    return res.status(401).json({ error: "Refresh token is missing" });
  }

  try {
    // 1. Verify token signature
    const decoded = jwt.verify(refreshToken, REFRESH_SECRET);

    // 2. Check if token exists in DB, is not expired, and belongs to user
    const dbToken = db.prepare(`
      SELECT * FROM refresh_tokens 
      WHERE token = ? AND user_id = ? AND expires_at > datetime('now', 'localtime')
    `).get(refreshToken, decoded.userId);

    if (!dbToken) {
      return res.status(401).json({ error: "Refresh token is invalid or expired" });
    }

    // 3. Fetch user details to get current role
    const user = db.prepare('SELECT role FROM users WHERE user_id = ?').get(decoded.userId);
    if (!user) {
      return res.status(401).json({ error: "User not found" });
    }

    // 4. Issue a new access token (1h expiry)
    const newAccessToken = jwt.sign(
      { userId: decoded.userId, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    );

    return res.status(200).json({ accessToken: newAccessToken });
  } catch (err) {
    return res.status(401).json({ error: "Invalid refresh token" });
  }
}

function me(req, res) {
  try {
    // req.user is set by requireRole middleware
    const user = db.prepare(`
      SELECT user_id, name, email, phone, role, created_at
      FROM users WHERE user_id = ?
    `).get(req.user.userId);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({
      user_id: user.user_id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      created_at: new Date(user.created_at + 'Z').toISOString()
    });
  } catch (err) {
    console.error('Get profile error:', err);
    return res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  register,
  login,
  refresh,
  me
};
