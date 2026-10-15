const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const db = require('../db');
const { authMiddleware } = require('../auth');
const { sendFriendInvitationEmail, getEmailOutboxLog } = require('../mailer');

// Send Friend Request or External Email Invitation
router.post('/request', authMiddleware, async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Gmail / Email address is required' });
    }

    const cleanEmail = email.trim().toLowerCase();
    const senderId = req.user.id;

    const sender = db.prepare('SELECT * FROM users WHERE id = ?').get(senderId);
    if (!sender) return res.status(404).json({ error: 'Sender user not found' });

    if (cleanEmail === sender.email.toLowerCase()) {
      return res.status(400).json({ error: 'You cannot send a friend request to your own email address' });
    }

    // Check if target email belongs to a registered user
    const targetUser = db.prepare('SELECT * FROM users WHERE email = ?').get(cleanEmail);

    // Check if friendship already exists
    if (targetUser) {
      const u1 = senderId < targetUser.id ? senderId : targetUser.id;
      const u2 = senderId < targetUser.id ? targetUser.id : senderId;
      const existingFriendship = db.prepare('SELECT * FROM friendships WHERE user_id_1 = ? AND user_id_2 = ?').get(u1, u2);
      if (existingFriendship) {
        return res.status(400).json({ error: `${targetUser.display_name} is already in your contacts!` });
      }
    }

    // Check if pending request already exists from sender to target email
    const existingReq = db.prepare(`
      SELECT * FROM friend_requests WHERE sender_id = ? AND receiver_email = ? AND status = 'PENDING'
    `).get(senderId, cleanEmail);

    if (existingReq) {
      return res.status(400).json({ error: 'A pending request or invitation has already been sent to this email.' });
    }

    const reqId = crypto.randomUUID();
    const inviteCode = crypto.randomBytes(16).toString('hex');

    if (targetUser) {
      // User is registered
      db.prepare(`
        INSERT INTO friend_requests (id, sender_id, receiver_email, receiver_id, status, invite_code)
        VALUES (?, ?, ?, ?, 'PENDING', ?)
      `).run(reqId, senderId, cleanEmail, targetUser.id, inviteCode);

      return res.json({
        success: true,
        type: 'INTERNAL_REQUEST',
        message: `Friend request sent to ${targetUser.display_name} (${cleanEmail})!`,
        request: {
          id: reqId,
          receiver_email: cleanEmail,
          receiver: {
            id: targetUser.id,
            display_name: targetUser.display_name,
            avatar_url: targetUser.avatar_url,
          }
        }
      });
    } else {
      // User is not registered -> Send Nodemailer External Email Invitation!
      db.prepare(`
        INSERT INTO friend_requests (id, sender_id, receiver_email, receiver_id, status, invite_code)
        VALUES (?, ?, ?, NULL, 'PENDING', ?)
      `).run(reqId, senderId, cleanEmail, inviteCode);

      const emailResult = await sendFriendInvitationEmail({
        senderName: sender.display_name,
        senderEmail: sender.email,
        receiverEmail: cleanEmail,
        inviteCode,
      });

      return res.json({
        success: true,
        type: 'EXTERNAL_INVITATION',
        message: `Automated email invitation sent to ${cleanEmail}!`,
        inviteCode,
        emailResult,
      });
    }
  } catch (err) {
    console.error('Friend request error:', err);
    return res.status(500).json({ error: 'Failed to process friend request' });
  }
});

// List Requests (Incoming, Outgoing & Invitations)
router.get('/requests', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = req.user.email.toLowerCase();

    // Incoming requests (where this user is the receiver)
    const incoming = db.prepare(`
      SELECT fr.id, fr.sender_id, fr.receiver_email, fr.status, fr.created_at, fr.invite_code,
             u.display_name as sender_name, u.email as sender_email, u.avatar_url as sender_avatar, u.bio as sender_bio
      FROM friend_requests fr
      JOIN users u ON fr.sender_id = u.id
      WHERE (fr.receiver_id = ? OR fr.receiver_email = ?) AND fr.status = 'PENDING'
      ORDER BY fr.created_at DESC
    `).all(userId, userEmail);

    // Outgoing requests (sent by this user)
    const outgoing = db.prepare(`
      SELECT fr.id, fr.receiver_email, fr.receiver_id, fr.status, fr.created_at, fr.invite_code,
             u.display_name as receiver_name, u.avatar_url as receiver_avatar
      FROM friend_requests fr
      LEFT JOIN users u ON fr.receiver_id = u.id
      WHERE fr.sender_id = ?
      ORDER BY fr.created_at DESC
    `).all(userId);

    return res.json({ incoming, outgoing });
  } catch (err) {
    console.error('Fetch requests error:', err);
    return res.status(500).json({ error: 'Failed to fetch friend requests' });
  }
});

// Respond to Request (ACCEPT or DECLINE)
router.post('/respond', authMiddleware, (req, res) => {
  try {
    const { request_id, action } = req.body; // action: 'ACCEPT' or 'DECLINE'
    const userId = req.user.id;
    const userEmail = req.user.email.toLowerCase();

    if (!request_id || !['ACCEPT', 'DECLINE'].includes(action)) {
      return res.status(400).json({ error: 'Invalid parameters' });
    }

    const request = db.prepare(`
      SELECT * FROM friend_requests WHERE id = ?
    `).get(request_id);

    if (!request) {
      return res.status(404).json({ error: 'Friend request not found' });
    }

    // Verify recipient matches
    if (request.receiver_id !== userId && request.receiver_email.toLowerCase() !== userEmail) {
      return res.status(403).json({ error: 'Not authorized to respond to this request' });
    }

    const newStatus = action === 'ACCEPT' ? 'ACCEPTED' : 'DECLINED';

    db.prepare(`
      UPDATE friend_requests
      SET status = ?, receiver_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(newStatus, userId, request_id);

    if (action === 'ACCEPT') {
      const fsId = crypto.randomUUID();
      const u1 = request.sender_id < userId ? request.sender_id : userId;
      const u2 = request.sender_id < userId ? userId : request.sender_id;

      db.prepare(`
        INSERT OR IGNORE INTO friendships (id, user_id_1, user_id_2)
        VALUES (?, ?, ?)
      `).run(fsId, u1, u2);
    }

    return res.json({
      success: true,
      status: newStatus,
      message: `Friend request ${newStatus.toLowerCase()} successfully!`,
    });
  } catch (err) {
    console.error('Respond to request error:', err);
    return res.status(500).json({ error: 'Failed to process request action' });
  }
});

// List Accepted Active Contacts
router.get('/list', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    const friends = db.prepare(`
      SELECT u.id, u.email, u.display_name, u.avatar_url, u.bio, u.is_online, u.last_seen, f.created_at as friendship_date
      FROM friendships f
      JOIN users u ON (u.id = CASE WHEN f.user_id_1 = ? THEN f.user_id_2 ELSE f.user_id_1 END)
      WHERE f.user_id_1 = ? OR f.user_id_2 = ?
      ORDER BY u.display_name ASC
    `).all(userId, userId, userId);

    return res.json({ friends });
  } catch (err) {
    console.error('Fetch friends list error:', err);
    return res.status(500).json({ error: 'Failed to fetch friends list' });
  }
});

// Email outbox preview inspector (for user live verification)
router.get('/email-outbox', authMiddleware, (req, res) => {
  return res.json({ outbox: getEmailOutboxLog() });
});

module.exports = router;
