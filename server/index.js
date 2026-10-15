const express = require('express');
const http = require('http');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const dotenv = require('dotenv');

dotenv.config();

const db = require('./db');
const { hashPassword } = require('./auth');
const { initSocket } = require('./socket');
const authRoutes = require('./routes/authRoutes');
const friendRoutes = require('./routes/friendRoutes');
const chatRoutes = require('./routes/chatRoutes');

const app = express();
const server = http.createServer(app);

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Ensure uploads folder exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}
app.use('/uploads', express.static(uploadsDir));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/friends', friendRoutes);
app.use('/api/chats', chatRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', time: new Date().toISOString() });
});

// Seed Demo Data if empty
function seedDemoData() {
  const count = db.prepare('SELECT COUNT(*) as count FROM users').get().count;
  if (count === 0) {
    console.log('Seeding initial WhatsApp Web demo users...');

    const passHash = hashPassword('password123');
    const u1 = 'usr_alice_101';
    const u2 = 'usr_bob_102';
    const u3 = 'usr_charlie_103';

    db.prepare(`
      INSERT INTO users (id, email, password_hash, display_name, avatar_url, bio, is_online)
      VALUES 
      (?, 'alice@gmail.com', ?, 'Alice Vance', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice', 'Building cool real-time web apps! 🚀', 1),
      (?, 'bob@gmail.com', ?, 'Bob Smith', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Bob', 'Available for real-time messaging 💬', 1),
      (?, 'charlie@gmail.com', ?, 'Charlie Brown', 'https://api.dicebear.com/7.x/avataaars/svg?seed=Charlie', 'At the office 💼', 0)
    `).run(u1, passHash, u2, passHash, u3, passHash);

    // Create friendships: Alice <-> Bob, Alice <-> Charlie
    db.prepare(`
      INSERT INTO friendships (id, user_id_1, user_id_2) VALUES (?, ?, ?), (?, ?, ?)
    `).run(crypto.randomUUID(), u1, u2, crypto.randomUUID(), u1, u3);

    // Create direct conversation between Alice & Bob
    const conv1 = 'conv_alice_bob';
    db.prepare(`INSERT INTO conversations (id, type) VALUES (?, 'direct')`).run(conv1);
    db.prepare(`INSERT INTO conversation_members (id, conversation_id, user_id) VALUES (?, ?, ?), (?, ?, ?)`).run(
      crypto.randomUUID(), conv1, u1,
      crypto.randomUUID(), conv1, u2
    );

    // Add initial messages
    const m1 = crypto.randomUUID();
    const m2 = crypto.randomUUID();
    db.prepare(`
      INSERT INTO messages (id, conversation_id, sender_id, content, created_at)
      VALUES 
      (?, ?, ?, 'Hey Bob! Welcome to WhatsApp Web clone with real-time socket delivery.', DATETIME('now', '-10 minutes')),
      (?, ?, ?, 'Hi Alice! This is awesome! Love the green WhatsApp dark theme aesthetics.', DATETIME('now', '-5 minutes'))
    `).run(m1, conv1, u1, m2, conv1, u2);

    db.prepare(`
      INSERT INTO message_status (id, message_id, user_id, status)
      VALUES 
      (?, ?, ?, 'READ'),
      (?, ?, ?, 'READ')
    `).run(crypto.randomUUID(), m1, u2, crypto.randomUUID(), m2, u1);

    console.log('Demo users seeded: alice@gmail.com, bob@gmail.com, charlie@gmail.com (password: password123)');
  }
}

seedDemoData();

// Init Socket.io
initSocket(server);

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
