class AppUser {
  final String id;
  final String email;
  final String displayName;
  final String avatarUrl;
  final String bio;
  final bool isOnline;
  final String? lastSeen;
  final String? createdAt;

  AppUser({
    required this.id,
    required this.email,
    required this.displayName,
    required this.avatarUrl,
    required this.bio,
    required this.isOnline,
    this.lastSeen,
    this.createdAt,
  });

  factory AppUser.fromJson(Map<String, dynamic> json) {
    return AppUser(
      id: json['id'] ?? '',
      email: json['email'] ?? '',
      displayName: json['display_name'] ?? 'User',
      avatarUrl: json['avatar_url'] ?? 'https://api.dicebear.com/7.x/avataaars/svg?seed=user',
      bio: json['bio'] ?? 'Hey there!',
      isOnline: (json['is_online'] == 1 || json['is_online'] == true),
      lastSeen: json['last_seen'],
      createdAt: json['created_at'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'email': email,
      'display_name': displayName,
      'avatar_url': avatarUrl,
      'bio': bio,
      'is_online': isOnline ? 1 : 0,
      'last_seen': lastSeen,
      'created_at': createdAt,
    };
  }
}
