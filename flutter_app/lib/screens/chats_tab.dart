import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../data/contacts_data.dart';
import '../widgets/avatar_widget.dart';

class ChatsTab extends StatefulWidget {
  const ChatsTab({super.key});

  @override
  State<ChatsTab> createState() => ChatsTabState();
}

class ChatsTabState extends State<ChatsTab> {
  String _searchQuery = '';

  List<DemoContact> get _filtered => demoContacts
      .where((c) =>
          NicknameStore.displayName(c.id, c.originalName)
              .toLowerCase()
              .contains(_searchQuery.toLowerCase()) ||
          c.lastMsg.toLowerCase().contains(_searchQuery.toLowerCase()))
      .toList();

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          // ── Header ──────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Row(
              children: [
                ShaderMask(
                  shaderCallback: (b) =>
                      AppTheme.primaryGradient.createShader(b),
                  child: const Text(
                    'PulseChat',
                    style: TextStyle(
                      fontSize: 26,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.5,
                    ),
                  ),
                ),
                const Spacer(),
                _IconBtn(icon: Icons.search_rounded),
                const SizedBox(width: 4),
                _IconBtn(icon: Icons.person_add_alt_1_rounded),
                const SizedBox(width: 4),
                _IconBtn(icon: Icons.more_vert_rounded),
              ],
            ),
          ),

          // ── Search bar ─────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: Container(
              decoration: AppTheme.glassBox(borderRadius: 14),
              child: TextField(
                onChanged: (v) => setState(() => _searchQuery = v),
                style:
                    const TextStyle(color: AppTheme.textMain, fontSize: 14),
                decoration: const InputDecoration(
                  hintText: 'Search conversations…',
                  hintStyle:
                      TextStyle(color: AppTheme.textMuted, fontSize: 14),
                  prefixIcon: Icon(Icons.search,
                      color: AppTheme.textMuted, size: 20),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),

          // ── Chat list ──────────────────────────────────────────
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _filtered.length,
              separatorBuilder: (_, __) => Divider(
                color: AppTheme.borderGlass,
                height: 1,
                indent: 76,
              ),
              itemBuilder: (context, i) {
                final contact = _filtered[i];
                final displayName = NicknameStore.displayName(
                    contact.id, contact.originalName);
                final hasUnread = contact.unread > 0;

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 4, vertical: 6),
                  leading: AvatarWidget(
                    name: displayName,
                    isOnline: contact.isOnline,
                    size: 52,
                  ),
                  title: Text(
                    displayName,
                    style: TextStyle(
                      color: AppTheme.textMain,
                      fontWeight:
                          hasUnread ? FontWeight.w700 : FontWeight.w500,
                      fontSize: 15,
                    ),
                  ),
                  subtitle: Row(
                    children: [
                      if (NicknameStore.getNickname(contact.id).isNotEmpty)
                        Padding(
                          padding: const EdgeInsets.only(right: 4),
                          child: Text(
                            '(${contact.originalName})',
                            style: const TextStyle(
                              color: AppTheme.primary,
                              fontSize: 11,
                            ),
                          ),
                        ),
                      Expanded(
                        child: Text(
                          contact.lastMsg,
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis,
                          style: TextStyle(
                            color: hasUnread
                                ? AppTheme.textMain
                                : AppTheme.textMuted,
                            fontSize: 13,
                          ),
                        ),
                      ),
                    ],
                  ),
                  trailing: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: [
                      Text(
                        contact.time,
                        style: TextStyle(
                          fontSize: 11,
                          color: hasUnread
                              ? AppTheme.primaryLight
                              : AppTheme.textMuted,
                        ),
                      ),
                      const SizedBox(height: 6),
                      if (hasUnread)
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 7, vertical: 2),
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            '${contact.unread}',
                            style: const TextStyle(
                              color: Colors.white,
                              fontSize: 11,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                    ],
                  ),
                  onTap: () {},
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}

class _IconBtn extends StatelessWidget {
  final IconData icon;
  const _IconBtn({required this.icon});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
        color: AppTheme.surfaceLight,
        shape: BoxShape.circle,
        border: Border.all(color: AppTheme.borderGlass),
      ),
      child: Icon(icon, color: AppTheme.textMuted, size: 20),
    );
  }
}
