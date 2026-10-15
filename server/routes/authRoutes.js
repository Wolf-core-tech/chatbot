const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { hashPassword, comparePassword, generateToken, authMiddleware } = require('../auth');

// Register
router.post('/register', (req, res) => {
  try {
    const { email, password, display_name, avatar_url, bio, invite_code } = req.body;

    if (!email || !password || !display_name) {
      return res.status(400).json({ error: 'Email, password, and display name are required' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check if user exists
    const existing = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);
    if (existing) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }

    const userId = crypto.randomUUID();
    const pHash = hashPassword(password);
    const avatar = avatar_url || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`;
    const userBio = bio || 'Hey there! I am using WhatsApp.';

    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, avatar_url, bio, is_online)
      VALUES (?, ?, ?, ?, ?, ?, 1)
    `).run(userId, cleanEmail, pHash, display_name, avatar, userBio);

    const newUser = db.prepare('SELECT id, email, display_name, avatar_url, bio, is_online, created_at FROM users WHERE id = ?').get(userId);
    const token = generateToken(newUser);

    // Process any pending invitations sent to this email!
    const pendingRequests = db.prepare(`
      SELECT * FROM friend_requests WHERE receiver_email = ? AND status = 'PENDING'
    `).all(cleanEmail);

    for (const pReq of pendingRequests) {
      db.prepare(`
        UPDATE friend_requests SET receiver_id = ? WHERE id = ?
      `).run(userId, pReq.id);

      // If registered with invite code or auto-accepted, connect as friends immediately!
      if (invite_code && pReq.invite_code === invite_code) {
        db.prepare(`
          UPDATE friend_requests SET status = 'ACCEPTED', updated_at = CURRENT_TIMESTAMP WHERE id = ?
        `).run(pReq.id);

        const fsId = crypto.randomUUID();
        const user1 = pReq.sender_id < userId ? pReq.sender_id : userId;
        const user2 = pReq.sender_id < userId ? userId : pReq.sender_id;

        db.prepare(`
          INSERT OR IGNORE INTO friendships (id, user_id_1, user_id_2)
          VALUES (?, ?, ?)
        `).run(fsId, user1, user2);
      }
    }

    return res.status(201).json({
      user: newUser,
      token,
      message: 'Account created successfully',
    });
  } catch (err) {
    console.error('Registration error:', err);
    return res.status(500).json({ error: 'Failed to create user' });
  }
});

// Login
router.post('/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    if (!user || !comparePassword(password, user.password_hash)) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Set online
    db.prepare('UPDATE users SET is_online = 1 WHERE id = ?').run(user.id);

    const safeUser = {
      id: user.id,
      email: user.email,
      display_name: user.display_name,
      avatar_url: user.avatar_url,
      bio: user.bio,
      is_online: 1,
      created_at: user.created_at,
    };

    const token = generateToken(safeUser);
    return res.json({ user: safeUser, token });
  } catch (err) {
    console.error('Login error:', err);
    return res.status(500).json({ error: 'Failed to log in' });
  }
});

// Get current user profile
router.get('/me', authMiddleware, (req, res) => {
  try {
    const user = db.prepare(`
      SELECT id, email, display_name, avatar_url, bio, is_online, created_at FROM users WHERE id = ?
    `).get(req.user.id);

    if (!user) return res.status(404).json({ error: 'User not found' });
    return res.json({ user });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to fetch user profile' });
  }
});

// Update Profile
router.put('/profile', authMiddleware, (req, res) => {
  try {
    const { display_name, bio, avatar_url } = req.body;
    const currentUser = db.prepare('SELECT * FROM users WHERE id = ?').get(req.user.id);

    if (!currentUser) return res.status(404).json({ error: 'User not found' });

    const newDisplayName = display_name || currentUser.display_name;
    const newBio = bio !== undefined ? bio : currentUser.bio;
    const newAvatar = avatar_url || currentUser.avatar_url;

    db.prepare(`
      UPDATE users SET display_name = ?, bio = ?, avatar_url = ? WHERE id = ?
    `).run(newDisplayName, newBio, newAvatar, req.user.id);

    const updated = db.prepare(`
      SELECT id, email, display_name, avatar_url, bio, is_online, created_at FROM users WHERE id = ?
    `).get(req.user.id);

    return res.json({ user: updated, message: 'Profile updated' });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Search users
router.get('/users/search', authMiddleware, (req, res) => {
  try {
    const query = (req.query.q || '').trim();
    if (!query) return res.json({ users: [] });

    const users = db.prepare(`
      SELECT id, email, display_name, avatar_url, bio, is_online, last_seen
      FROM users
      WHERE (email LIKE ? OR display_name LIKE ?) AND id != ?
      LIMIT 10
    `).all(`%${query}%`, `%${query}%`, req.user.id);

    return res.json({ users });
  } catch (err) {
    return res.status(500).json({ error: 'Search failed' });
  }
});

// Demo account list for fast testing/switching
router.get('/demo-accounts', (req, res) => {
  try {
    const users = db.prepare(`
      SELECT id, email, display_name, avatar_url, bio FROM users LIMIT 10
    `).all();
    return res.json({ accounts: users });
  } catch (err) {
    return res.status(500).json({ error: 'Failed to get demo accounts' });
  }
});

module.exports = router;
