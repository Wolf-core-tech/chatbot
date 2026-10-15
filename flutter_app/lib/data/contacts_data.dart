
// Simple in-memory nickname store (replace with SharedPreferences for persistence)
class NicknameStore {
  static final Map<String, String> _nicknames = {};

  static String getNickname(String contactId) => _nicknames[contactId] ?? '';

  static void setNickname(String contactId, String nickname) {
    if (nickname.trim().isEmpty) {
      _nicknames.remove(contactId);
    } else {
      _nicknames[contactId] = nickname.trim();
    }
  }

  static String displayName(String contactId, String originalName) {
    final nick = _nicknames[contactId];
    return (nick != null && nick.isNotEmpty) ? nick : originalName;
  }
}

// Demo contact model
class DemoContact {
  final String id;
  final String originalName;
  final String email;
  final bool isOnline;
  final String bio;
  final String lastMsg;
  final String time;
  final int unread;

  const DemoContact({
    required this.id,
    required this.originalName,
    required this.email,
    required this.isOnline,
    required this.bio,
    required this.lastMsg,
    required this.time,
    required this.unread,
  });
}

const List<DemoContact> demoContacts = [
  DemoContact(
    id: 'usr_alice_101',
    originalName: 'Alice Vance',
    email: 'alice@gmail.com',
    isOnline: true,
    bio: 'Building cool real-time web apps 🚀',
    lastMsg: 'Hey! How are you doing?',
    time: '13:42',
    unread: 2,
  ),
  DemoContact(
    id: 'usr_bob_102',
    originalName: 'Bob Smith',
    email: 'bob@gmail.com',
    isOnline: true,
    bio: 'Available for real-time messaging 💬',
    lastMsg: 'Love the dark theme aesthetics!',
    time: '13:37',
    unread: 0,
  ),
  DemoContact(
    id: 'grp_dev_201',
    originalName: 'Project Dev Team',
    email: '',
    isOnline: false,
    bio: 'Work group',
    lastMsg: 'You: Pushed the latest build 🔧',
    time: 'Yesterday',
    unread: 5,
  ),
  DemoContact(
    id: 'usr_charlie_103',
    originalName: 'Charlie Brown',
    email: 'charlie@gmail.com',
    isOnline: false,
    bio: 'At the office 💼',
    lastMsg: 'See you tomorrow!',
    time: 'Mon',
    unread: 0,
  ),
];
