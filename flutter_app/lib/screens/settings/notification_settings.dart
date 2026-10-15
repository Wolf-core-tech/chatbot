import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'settings_helpers.dart';

class NotificationSettingsPage extends StatefulWidget {
  const NotificationSettingsPage({super.key});
  @override
  State<NotificationSettingsPage> createState() => _NotificationSettingsPageState();
}

class _NotificationSettingsPageState extends State<NotificationSettingsPage> {
  bool _msgNotifications = true;
  bool _groupNotifications = true;
  bool _sound = true;
  bool _vibration = true;
  bool _preview = true;
  bool _reactions = true;
  String _tone = 'Default';
  final _tones = ['Default', 'Chime', 'Ping', 'Bell', 'None'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: buildSettingsAppBar(context, 'Notifications'),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          buildSectionHeader('Messages'),
          buildSwitchTile(icon: Icons.chat_bubble_rounded, color: AppTheme.primary, title: 'Message Notifications', subtitle: 'Alerts for new messages', value: _msgNotifications, onChanged: (v) => setState(() => _msgNotifications = v)),
          buildSwitchTile(icon: Icons.visibility_rounded, color: AppTheme.cyanNeon, title: 'Show Preview', subtitle: 'Display message content in notification', value: _preview, onChanged: (v) => setState(() => _preview = v)),
          buildSwitchTile(icon: Icons.add_reaction_rounded, color: AppTheme.roseNeon, title: 'Reaction Notifications', subtitle: 'Alert when someone reacts to your message', value: _reactions, onChanged: (v) => setState(() => _reactions = v)),
          const SizedBox(height: 16),
          buildSectionHeader('Groups'),
          buildSwitchTile(icon: Icons.group_rounded, color: AppTheme.emeraldNeon, title: 'Group Notifications', subtitle: 'Alerts for group messages', value: _groupNotifications, onChanged: (v) => setState(() => _groupNotifications = v)),
          const SizedBox(height: 16),
          buildSectionHeader('Sound & Vibration'),
          buildSwitchTile(icon: Icons.volume_up_rounded, color: AppTheme.primary, title: 'Sound', subtitle: 'Play sound on new message', value: _sound, onChanged: (v) => setState(() => _sound = v)),
          buildNavTile(icon: Icons.music_note_rounded, color: AppTheme.cyanNeon, title: 'Notification Tone', subtitle: _tone, onTap: _pickTone),
          buildSwitchTile(icon: Icons.vibration_rounded, color: AppTheme.roseNeon, title: 'Vibration', subtitle: 'Vibrate on new message', value: _vibration, onChanged: (v) => setState(() => _vibration = v)),
        ],
      ),
    );
  }

  void _pickTone() => showModalBottomSheet(
        context: context,
        backgroundColor: AppTheme.surfaceLight,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
        builder: (_) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Notification Tone', style: TextStyle(color: AppTheme.textMain, fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            ..._tones.map((t) => ListTile(
                  title: Text(t, style: const TextStyle(color: AppTheme.textMain)),
                  trailing: _tone == t ? const Icon(Icons.check_rounded, color: AppTheme.primary) : null,
                  onTap: () { setState(() => _tone = t); Navigator.pop(context); },
                )),
          ]),
        ),
      );
}
