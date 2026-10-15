const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const path = require('path');
const multer = require('multer');
const db = require('../db');
const { authMiddleware } = require('../auth');

// Multer storage setup for image/media uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '..', 'uploads');
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${crypto.randomBytes(6).toString('hex')}${ext}`);
  },
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// List User Conversations
router.get('/', authMiddleware, (req, res) => {
  try {
    const userId = req.user.id;

    // Get all conversation IDs user is a member of
    const userConvs = db.prepare(`
      SELECT c.id, c.type, c.name, c.avatar_url, c.created_by, c.created_at
      FROM conversations c
      JOIN conversation_members cm ON c.id = cm.conversation_id
      WHERE cm.user_id = ?
    `).all(userId);

    const formattedChats = userConvs.map((conv) => {
      // Get members
      const members = db.prepare(`
        SELECT u.id, u.email, u.display_name, u.avatar_url, u.bio, u.is_online, u.last_seen, cm.role
        FROM conversation_members cm
        JOIN users u ON cm.user_id = u.id
        WHERE cm.conversation_id = ?
      `).all(conv.id);

      // Get last message
      const lastMsg = db.prepare(`
        SELECT m.id, m.sender_id, m.content, m.media_url, m.media_type, m.created_at,
               u.display_name as sender_name
        FROM messages m
        JOIN users u ON m.sender_id = u.id
        WHERE m.conversation_id = ?
        ORDER BY m.created_at DESC
        LIMIT 1
      `).get(conv.id);

      // Get unread message count
      const unreadCount = db.prepare(`
        SELECT COUNT(*) as count
        FROM messages m
        LEFT JOIN message_status ms ON m.id = ms.message_id AND ms.user_id = ?
        WHERE m.conversation_id = ? AND m.sender_id != ? AND (ms.status IS NULL OR ms.status != 'READ')
      `).get(userId, conv.id, userId).count;

      // If direct chat, extract peer info
      let chatTitle = conv.name;
      let chatAvatar = conv.avatar_url;
      let peerUser = null;

      if (conv.type === 'direct') {
        peerUser = members.find((m) => m.id !== userId) || members[0];
        if (peerUser) {
          chatTitle = peerUser.display_name;
          chatAvatar = peerUser.avatar_url;
        }
      }

      return {
        id: conv.id,
        type: conv.type,
        name: chatTitle,
        avatar_url: chatAvatar,
        created_by: conv.created_by,
        created_at: conv.created_at,
        members,
        peerUser,
        lastMessage: lastMsg || null,
        unreadCount,
      };
    });

    // Sort by last message date or creation date
    formattedChats.sort((a, b) => {
      const timeA = a.lastMessage ? new Date(a.lastMessage.created_at).getTime() : new Date(a.created_at).getTime();
      const timeB = b.lastMessage ? new Date(b.lastMessage.created_at).getTime() : new Date(b.created_at).getTime();
      return timeB - timeA;
    });

    return res.json({ chats: formattedChats });
  } catch (err) {
    console.error('Fetch chats error:', err);
    return res.status(500).json({ error: 'Failed to fetch conversations' });
  }
});

// Get or Create Direct Chat
router.post('/direct', authMiddleware, (req, res) => {
  try {
    const { friend_id } = req.body;
    const userId = req.user.id;

    if (!friend_id) return res.status(400).json({ error: 'Friend ID is required' });

    // Verify friendship
    const u1 = userId < friend_id ? userId : friend_id;
    const u2 = userId < friend_id ? friend_id : userId;
    const isFriend = db.prepare('SELECT * FROM friendships WHERE user_id_1 = ? AND user_id_2 = ?').get(u1, u2);
    if (!isFriend) {
      return res.status(403).json({ error: 'You can only start direct chats with accepted friends.' });
    }

    // Check if direct conversation already exists between these 2 users
    const existingConv = db.prepare(`
      SELECT c.id FROM conversations c
      JOIN conversation_members cm1 ON c.id = cm1.conversation_id AND cm1.user_id = ?
      JOIN conversation_members cm2 ON c.id = cm2.conversation_id AND cm2.user_id = ?
      WHERE c.type = 'direct'
    `).get(userId, friend_id);

    if (existingConv) {
      return res.json({ conversation_id: existingConv.id, created: false });
    }

    // Create new direct conversation
    const convId = crypto.randomUUID();
    db.prepare(`
      INSERT INTO conversations (id, type, created_by) VALUES (?, 'direct', ?)
    `).run(convId, userId);

    db.prepare(`
      INSERT INTO conversation_members (id, conversation_id, user_id, role) VALUES (?, ?, ?, 'member')
    `).run(crypto.randomUUID(), convId, userId);

    db.prepare(`
      INSERT INTO conversation_members (id, conversation_id, user_id, role) VALUES (?, ?, ?, 'member')
    `).run(crypto.randomUUID(), convId, friend_id);

    return res.json({ conversation_id: convId, created: true });
  } catch (err) {
    console.error('Direct chat create error:', err);
    return res.status(500).json({ error: 'Failed to start direct conversation' });
  }
});

// Create Group Chat
router.post('/group', authMiddleware, (req, res) => {
  try {
    const { name, avatar_url, member_ids } = req.body; // array of user IDs
    const userId = req.user.id;

    if (!name || !member_ids || !Array.isArray(member_ids) || member_ids.length === 0) {
      return res.status(400).json({ error: 'Group name and at least one member are required' });
    }

    const convId = crypto.randomUUID();
    const grpAvatar = avatar_url || `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(name)}`;

    db.prepare(`
      INSERT INTO conversations (id, type, name, avatar_url, created_by)
      VALUES (?, 'group', ?, ?, ?)
    `).run(convId, name, grpAvatar, userId);

    // Add creator as admin
    db.prepare(`
      INSERT INTO conversation_members (id, conversation_id, user_id, role)
      VALUES (?, ?, ?, 'admin')
    `).run(crypto.randomUUID(), convId, userId);

    // Add selected friends
    const uniqueMembers = Array.from(new Set(member_ids)).filter(id => id !== userId);
    for (const mId of uniqueMembers) {
      db.prepare(`
        INSERT INTO conversation_members (id, conversation_id, user_id, role)
        VALUES (?, ?, ?, 'member')
      `).run(crypto.randomUUID(), convId, mId);
    }

    return res.status(201).json({ conversation_id: convId, message: 'Group chat created' });
  } catch (err) {
    console.error('Group chat error:', err);
    return res.status(500).json({ error: 'Failed to create group chat' });
  }
});

// Fetch Messages for a Conversation
router.get('/:id/messages', authMiddleware, (req, res) => {
  try {
    const convId = req.params.id;
    const userId = req.user.id;

    // Verify membership
    const member = db.prepare('SELECT * FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(convId, userId);
    if (!member) {
      return res.status(403).json({ error: 'Access denied: You are not a member of this chat' });
    }

    const messages = db.prepare(`
      SELECT m.id, m.conversation_id, m.sender_id, m.content, m.media_url, m.media_type, m.reply_to_id, m.created_at,
             u.display_name as sender_name, u.avatar_url as sender_avatar
      FROM messages m
      JOIN users u ON m.sender_id = u.id
      WHERE m.conversation_id = ?
      ORDER BY m.created_at ASC
    `).all(convId);

    // Attach read statuses to each message
    const formattedMessages = messages.map((msg) => {
      const statuses = db.prepare(`
        SELECT ms.user_id, ms.status, ms.updated_at, u.display_name
        FROM message_status ms
        JOIN users u ON ms.user_id = u.id
        WHERE ms.message_id = ?
      `).all(msg.id);

      // Determine overall status for sent messages
      let overallStatus = 'SENT'; // 'SENT', 'DELIVERED', 'READ'
      if (statuses.length > 0) {
        if (statuses.every(s => s.status === 'READ')) {
          overallStatus = 'READ';
        } else if (statuses.some(s => s.status === 'DELIVERED' || s.status === 'READ')) {
          overallStatus = 'DELIVERED';
        }
      }

      return {
        ...msg,
        statuses,
        overallStatus,
      };
    });

    // Mark unread messages as read for this user
    db.prepare(`
      UPDATE message_status
      SET status = 'READ', updated_at = CURRENT_TIMESTAMP
      WHERE user_id = ? AND message_id IN (
        SELECT id FROM messages WHERE conversation_id = ? AND sender_id != ?
      )
    `).run(userId, convId, userId);

    return res.json({ messages: formattedMessages });
  } catch (err) {
    console.error('Fetch messages error:', err);
    return res.status(500).json({ error: 'Failed to fetch chat messages' });
  }
});

// Upload Attachment (Image/Media)
router.post('/upload', authMiddleware, upload.single('file'), (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });

    const fileUrl = `/uploads/${req.file.filename}`;
    const mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';

    return res.json({
      url: fileUrl,
      mediaType,
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });
  } catch (err) {
    console.error('Upload error:', err);
    return res.status(500).json({ error: 'Failed to upload attachment' });
  }
});

module.exports = router;
