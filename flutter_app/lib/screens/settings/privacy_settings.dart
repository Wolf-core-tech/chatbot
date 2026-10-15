import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'settings_helpers.dart';

class PrivacySettingsPage extends StatefulWidget {
  const PrivacySettingsPage({super.key});
  @override
  State<PrivacySettingsPage> createState() => _PrivacySettingsPageState();
}

class _PrivacySettingsPageState extends State<PrivacySettingsPage> {
  String _lastSeen = 'Everyone';
  String _profilePhoto = 'My Contacts';
  String _about = 'Everyone';
  bool _readReceipts = true;
  bool _typingIndicator = true;
  bool _twoStep = false;
  final _visibilityOptions = ['Everyone', 'My Contacts', 'Nobody'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: buildSettingsAppBar(context, 'Privacy'),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          buildSectionHeader('Who Can See My Info'),
          _selectTile(icon: Icons.access_time_rounded, color: AppTheme.primary, title: 'Last Seen', value: _lastSeen, onTap: () => _pick('Last Seen', _lastSeen, (v) => setState(() => _lastSeen = v))),
          _selectTile(icon: Icons.person_rounded, color: AppTheme.cyanNeon, title: 'Profile Photo', value: _profilePhoto, onTap: () => _pick('Profile Photo', _profilePhoto, (v) => setState(() => _profilePhoto = v))),
          _selectTile(icon: Icons.info_outline_rounded, color: AppTheme.emeraldNeon, title: 'About / Bio', value: _about, onTap: () => _pick('About', _about, (v) => setState(() => _about = v))),
          const SizedBox(height: 16),
          buildSectionHeader('Messaging'),
          buildSwitchTile(icon: Icons.done_all_rounded, color: AppTheme.emeraldNeon, title: 'Read Receipts', subtitle: 'If turned off, others won\'t see yours either', value: _readReceipts, onChanged: (v) => setState(() => _readReceipts = v)),
          buildSwitchTile(icon: Icons.keyboard_rounded, color: AppTheme.cyanNeon, title: 'Typing Indicator', subtitle: 'Show when you\'re typing a message', value: _typingIndicator, onChanged: (v) => setState(() => _typingIndicator = v)),
          const SizedBox(height: 16),
          buildSectionHeader('Security'),
          buildSwitchTile(icon: Icons.lock_rounded, color: AppTheme.roseNeon, title: 'Two-Step Verification', subtitle: 'Add an extra PIN for account security', value: _twoStep, onChanged: (v) => setState(() => _twoStep = v)),
          buildNavTile(icon: Icons.block_rounded, color: AppTheme.roseNeon, title: 'Blocked Contacts', subtitle: 'Manage blocked users', onTap: () {}),
        ],
      ),
    );
  }

  void _pick(String title, String current, void Function(String) onSelect) => showModalBottomSheet(
        context: context,
        backgroundColor: AppTheme.surfaceLight,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
        builder: (_) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title, style: const TextStyle(color: AppTheme.textMain, fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            ..._visibilityOptions.map((o) => ListTile(
                  title: Text(o, style: const TextStyle(color: AppTheme.textMain)),
                  trailing: current == o ? const Icon(Icons.check_rounded, color: AppTheme.primary) : null,
                  onTap: () { onSelect(o); Navigator.pop(context); },
                )),
          ]),
        ),
      );

  Widget _selectTile({required IconData icon, required Color color, required String title, required String value, required VoidCallback onTap}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Material(
        color: Colors.transparent,
        child: InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: AppTheme.glassBox(borderRadius: 14),
            child: Row(children: [
              buildIconBox(icon, color),
              const SizedBox(width: 12),
              Expanded(child: Text(title, style: const TextStyle(color: AppTheme.textMain, fontWeight: FontWeight.w600, fontSize: 14))),
              Text(value, style: const TextStyle(color: AppTheme.primaryLight, fontSize: 13)),
              const SizedBox(width: 4),
              const Icon(Icons.chevron_right_rounded, color: AppTheme.textMuted, size: 20),
            ]),
          ),
        ),
      ),
    );
  }
}
