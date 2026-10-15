const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('./db');
const { JWT_SECRET } = require('./auth');

// Map of userId -> Set of socketIds
const onlineUsers = new Map();

function initSocket(httpServer) {
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
      methods: ['GET', 'POST'],
    },
  });

  // Socket middleware for authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: Missing token'));
    }

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      socket.user = decoded;
      next();
    } catch (err) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.user.id;
    console.log(`[Socket] User connected: ${socket.user.display_name} (${userId})`);

    // Track user socket
    if (!onlineUsers.has(userId)) {
      onlineUsers.set(userId, new Set());
    }
    onlineUsers.get(userId).add(socket.id);

    // Join personal room for notifications
    socket.join(`user_${userId}`);

    // Update online state in DB
    db.prepare('UPDATE users SET is_online = 1 WHERE id = ?').run(userId);
    io.emit('user_status_change', { userId, is_online: 1 });

    // Join conversation rooms
    const userConvs = db.prepare(`
      SELECT conversation_id FROM conversation_members WHERE user_id = ?
    `).all(userId);

    userConvs.forEach((c) => {
      socket.join(`conv_${c.conversation_id}`);
    });

    // Handle Join Room
    socket.on('join_conversation', (convId) => {
      socket.join(`conv_${convId}`);
    });

    // Handle Send Message
    socket.on('send_message', (data, callback) => {
      try {
        const { conversation_id, content, media_url, media_type, reply_to_id } = data;

        if (!conversation_id || (!content && !media_url)) {
          if (callback) callback({ error: 'Message content or media required' });
          return;
        }

        // Verify sender is member
        const member = db.prepare('SELECT * FROM conversation_members WHERE conversation_id = ? AND user_id = ?').get(conversation_id, userId);
        if (!member) {
          if (callback) callback({ error: 'Not a member of this chat' });
          return;
        }

        const msgId = crypto.randomUUID();
        const createdAt = new Date().toISOString();

        // Save message
        db.prepare(`
          INSERT INTO messages (id, conversation_id, sender_id, content, media_url, media_type, reply_to_id, created_at)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        `).run(msgId, conversation_id, userId, content || '', media_url || null, media_type || null, reply_to_id || null, createdAt);

        // Fetch sender info
        const senderInfo = db.prepare('SELECT id, display_name, avatar_url FROM users WHERE id = ?').get(userId);

        // Fetch all members of conversation
        const members = db.prepare('SELECT user_id FROM conversation_members WHERE conversation_id = ?').all(conversation_id);

        let initialStatus = 'SENT';
        const statuses = [];

        // Insert initial message status for each recipient
        members.forEach((m) => {
          if (m.user_id !== userId) {
            const isRecipientOnline = onlineUsers.has(m.user_id) && onlineUsers.get(m.user_id).size > 0;
            const recipientStatus = isRecipientOnline ? 'DELIVERED' : 'SENT';

            db.prepare(`
              INSERT INTO message_status (id, message_id, user_id, status)
              VALUES (?, ?, ?, ?)
            `).run(crypto.randomUUID(), msgId, m.user_id, recipientStatus);

            statuses.push({ user_id: m.user_id, status: recipientStatus });
          }
        });

        if (statuses.some(s => s.status === 'DELIVERED')) {
          initialStatus = 'DELIVERED';
        }

        const fullMsg = {
          id: msgId,
          conversation_id,
          sender_id: userId,
          sender_name: senderInfo.display_name,
          sender_avatar: senderInfo.avatar_url,
          content: content || '',
          media_url: media_url || null,
          media_type: media_type || null,
          reply_to_id: reply_to_id || null,
          created_at: createdAt,
          statuses,
          overallStatus: initialStatus,
        };

        // Emit to room
        io.to(`conv_${conversation_id}`).emit('new_message', fullMsg);

        // Also notify user personal rooms for conversation list updating
        members.forEach((m) => {
          io.to(`user_${m.user_id}`).emit('conversation_updated', {
            conversation_id,
            lastMessage: fullMsg,
          });
        });

        if (callback) callback({ success: true, message: fullMsg });
      } catch (err) {
        console.error('Socket send_message error:', err);
        if (callback) callback({ error: 'Failed to send message' });
      }
    });

    // Handle Typing Start/Stop
    socket.on('typing_start', ({ conversation_id }) => {
      socket.to(`conv_${conversation_id}`).emit('user_typing_start', {
        conversation_id,
        user_id: userId,
        display_name: socket.user.display_name,
      });
    });

    socket.on('typing_stop', ({ conversation_id }) => {
      socket.to(`conv_${conversation_id}`).emit('user_typing_stop', {
        conversation_id,
        user_id: userId,
      });
    });

    // Handle Read Receipts (Mark Messages Read)
    socket.on('mark_read', ({ conversation_id }) => {
      try {
        db.prepare(`
          UPDATE message_status
          SET status = 'READ', updated_at = CURRENT_TIMESTAMP
          WHERE user_id = ? AND message_id IN (
            SELECT id FROM messages WHERE conversation_id = ? AND sender_id != ?
          )
        `).run(userId, conversation_id, userId);

        // Notify room members that messages were read
        io.to(`conv_${conversation_id}`).emit('messages_read', {
          conversation_id,
          read_by: userId,
        });
      } catch (err) {
        console.error('Socket mark_read error:', err);
      }
    });

    // Handle Disconnect
    socket.on('disconnect', () => {
      console.log(`[Socket] Disconnected: ${socket.user.display_name}`);
      const userSockets = onlineUsers.get(userId);
      if (userSockets) {
        userSockets.delete(socket.id);
        if (userSockets.size === 0) {
          onlineUsers.delete(userId);
          const lastSeen = new Date().toISOString();
          db.prepare('UPDATE users SET is_online = 0, last_seen = ? WHERE id = ?').run(lastSeen, userId);
          io.emit('user_status_change', { userId, is_online: 0, last_seen: lastSeen });
        }
      }
    });
  });

  return io;
}

module.exports = { initSocket };
