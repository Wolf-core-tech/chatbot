import 'user.dart';

class ChatMessage {
  final String id;
  final String conversationId;
  final String senderId;
  final String senderName;
  final String? senderAvatar;
  final String content;
  final String? mediaUrl;
  final String? mediaType;
  final String? replyToId;
  final String createdAt;
  final String overallStatus; // 'SENT', 'DELIVERED', 'READ'

  ChatMessage({
    required this.id,
    required this.conversationId,
    required this.senderId,
    required this.senderName,
    this.senderAvatar,
    required this.content,
    this.mediaUrl,
    this.mediaType,
    this.replyToId,
    required this.createdAt,
    this.overallStatus = 'SENT',
  });

  factory ChatMessage.fromJson(Map<String, dynamic> json) {
    return ChatMessage(
      id: json['id'] ?? '',
      conversationId: json['conversation_id'] ?? '',
      senderId: json['sender_id'] ?? '',
      senderName: json['sender_name'] ?? 'Unknown',
      senderAvatar: json['sender_avatar'],
      content: json['content'] ?? '',
      mediaUrl: json['media_url'],
      mediaType: json['media_type'],
      replyToId: json['reply_to_id'],
      createdAt: json['created_at'] ?? DateTime.now().toIso8601String(),
      overallStatus: json['overallStatus'] ?? 'SENT',
    );
  }
}

class Conversation {
  final String id;
  final String type; // 'direct' or 'group'
  final String name;
  final String avatarUrl;
  final String? createdBy;
  final String createdAt;
  final List<AppUser> members;
  final AppUser? peerUser;
  final ChatMessage? lastMessage;
  final int unreadCount;

  Conversation({
    required this.id,
    required this.type,
    required this.name,
    required this.avatarUrl,
    this.createdBy,
    required this.createdAt,
    required this.members,
    this.peerUser,
    this.lastMessage,
    this.unreadCount = 0,
  });

  factory Conversation.fromJson(Map<String, dynamic> json) {
    List<AppUser> mList = [];
    if (json['members'] != null) {
      mList = (json['members'] as List).map((m) => AppUser.fromJson(m)).toList();
    }

    AppUser? peer;
    if (json['peerUser'] != null) {
      peer = AppUser.fromJson(json['peerUser']);
    }

    ChatMessage? lastMsg;
    if (json['lastMessage'] != null) {
      lastMsg = ChatMessage.fromJson(json['lastMessage']);
    }

    return Conversation(
      id: json['id'] ?? '',
      type: json['type'] ?? 'direct',
      name: json['name'] ?? 'Chat',
      avatarUrl: json['avatar_url'] ?? 'https://api.dicebear.com/7.x/identicon/svg?seed=chat',
      createdBy: json['created_by'],
      createdAt: json['created_at'] ?? '',
      members: mList,
      peerUser: peer,
      lastMessage: lastMsg,
      unreadCount: json['unreadCount'] ?? 0,
    );
  }
}
