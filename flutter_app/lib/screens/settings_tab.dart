import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import 'settings/profile_settings.dart';
import 'settings/chat_settings.dart';
import 'settings/notification_settings.dart';
import 'settings/privacy_settings.dart';
import 'settings/terms_screen.dart';

class SettingsTab extends StatelessWidget {
  const SettingsTab({super.key});

  static const _items = [
    _SettingItem(
      icon: Icons.person_rounded,
      label: 'Profile',
      subtitle: 'Name, bio, avatar',
      gradient: [Color(0xFF8B5CF6), Color(0xFF6D28D9)],
      route: 'profile',
    ),
    _SettingItem(
      icon: Icons.chat_bubble_rounded,
      label: 'Chat Settings',
      subtitle: 'Wallpaper, font size, media',
      gradient: [Color(0xFF06B6D4), Color(0xFF0284C7)],
      route: 'chat',
    ),
    _SettingItem(
      icon: Icons.notifications_rounded,
      label: 'Notifications',
      subtitle: 'Message alerts, sounds, vibration',
      gradient: [Color(0xFFEC4899), Color(0xFFBE185D)],
      route: 'notifications',
    ),
    _SettingItem(
      icon: Icons.lock_rounded,
      label: 'Privacy',
      subtitle: 'Last seen, read receipts, blocked',
      gradient: [Color(0xFF10B981), Color(0xFF047857)],
      route: 'privacy',
    ),
    _SettingItem(
      icon: Icons.article_rounded,
      label: 'Terms & Conditions',
      subtitle: 'Usage policy, legal information',
      gradient: [Color(0xFFF59E0B), Color(0xFFD97706)],
      route: 'terms',
    ),
  ];

  void _navigate(BuildContext context, String route) {
    Widget page;
    switch (route) {
      case 'profile':
        page = const ProfileSettingsPage();
        break;
      case 'chat':
        page = const ChatSettingsPage();
        break;
      case 'notifications':
        page = const NotificationSettingsPage();
        break;
      case 'privacy':
        page = const PrivacySettingsPage();
        break;
      case 'terms':
        page = const TermsScreen();
        break;
      default:
        return;
    }
    Navigator.of(context).push(
      MaterialPageRoute(builder: (_) => page),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: CustomScrollView(
        slivers: [
          // ── Header ────────────────────────────────────────────
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(16, 14, 16, 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Text(
                    'Settings',
                    style: TextStyle(
                      fontSize: 24,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.textMain,
                      letterSpacing: -0.5,
                    ),
                  ),
                  const SizedBox(height: 16),

                  // Profile card
                  Container(
                    padding: const EdgeInsets.all(16),
                    decoration: AppTheme.glassBox(borderRadius: 18),
                    child: Row(
                      children: [
                        Container(
                          width: 60,
                          height: 60,
                          decoration: const BoxDecoration(
                            shape: BoxShape.circle,
                            gradient: AppTheme.avatarGlowGradient,
                          ),
                          padding: const EdgeInsets.all(2.5),
                          child: const CircleAvatar(
                            backgroundColor: AppTheme.surfaceLight,
                            child: Text(
                              'Y',
                              style: TextStyle(
                                color: AppTheme.textMain,
                                fontWeight: FontWeight.bold,
                                fontSize: 24,
                              ),
                            ),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const Text(
                                'Your Name',
                                style: TextStyle(
                                  color: AppTheme.textMain,
                                  fontWeight: FontWeight.w700,
                                  fontSize: 16,
                                ),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                'you@gmail.com',
                                style: TextStyle(
                                  color: AppTheme.cyanNeon,
                                  fontSize: 13,
                                ),
                              ),
                              const SizedBox(height: 2),
                              const Text(
                                'Hey there! I am using PulseChat.',
                                style: TextStyle(
                                  color: AppTheme.textMuted,
                                  fontSize: 12,
                                ),
                              ),
                            ],
                          ),
                        ),
                        GestureDetector(
                          onTap: () => _navigate(context, 'profile'),
                          child: Container(
                            padding: const EdgeInsets.all(8),
                            decoration: BoxDecoration(
                              color: AppTheme.primary.withValues(alpha: 0.15),
                              borderRadius: BorderRadius.circular(10),
                              border: Border.all(
                                  color: AppTheme.primary.withValues(alpha: 0.3)),
                            ),
                            child: const Icon(Icons.edit_rounded,
                                color: AppTheme.primaryLight, size: 18),
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Settings items ────────────────────────────────────
          SliverPadding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            sliver: SliverList(
              delegate: SliverChildBuilderDelegate(
                (context, index) {
                  final item = _items[index];
                  return Padding(
                    padding: const EdgeInsets.only(bottom: 10),
                    child: _SettingTile(
                      item: item,
                      onTap: () => _navigate(context, item.route),
                    ),
                  );
                },
                childCount: _items.length,
              ),
            ),
          ),

          // ── Footer ───────────────────────────────────────────
          const SliverToBoxAdapter(
            child: Padding(
              padding: EdgeInsets.all(24),
              child: Center(
                child: Text(
                  'PulseChat v1.0.0\nBuilt with Flutter ❤️',
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    color: AppTheme.textMuted,
                    fontSize: 12,
                    height: 1.6,
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _SettingItem {
  final IconData icon;
  final String label;
  final String subtitle;
  final List<Color> gradient;
  final String route;

  const _SettingItem({
    required this.icon,
    required this.label,
    required this.subtitle,
    required this.gradient,
    required this.route,
  });
}

class _SettingTile extends StatelessWidget {
  final _SettingItem item;
  final VoidCallback onTap;

  const _SettingTile({required this.item, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(16),
        splashColor: AppTheme.primary.withValues(alpha: 0.12),
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          decoration: AppTheme.glassBox(borderRadius: 16),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  gradient: LinearGradient(
                    colors: item.gradient,
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Icon(item.icon, color: Colors.white, size: 22),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.label,
                      style: const TextStyle(
                        color: AppTheme.textMain,
                        fontWeight: FontWeight.w600,
                        fontSize: 15,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      item.subtitle,
                      style: const TextStyle(
                        color: AppTheme.textMuted,
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded,
                  color: AppTheme.textMuted, size: 22),
            ],
          ),
        ),
      ),
    );
  }
}
