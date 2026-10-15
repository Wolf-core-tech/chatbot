import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'settings_helpers.dart';

class ChatSettingsPage extends StatefulWidget {
  const ChatSettingsPage({super.key});
  @override
  State<ChatSettingsPage> createState() => _ChatSettingsPageState();
}

class _ChatSettingsPageState extends State<ChatSettingsPage> {
  bool _enterToSend = false;
  bool _mediaAutoDownload = true;
  bool _readReceipts = true;
  double _fontSize = 14;
  String _wallpaper = 'Dark Grid';
  final _wallpapers = ['Dark Grid', 'Midnight Blue', 'Deep Purple', 'Cosmic Black', 'None'];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: buildSettingsAppBar(context, 'Chat Settings'),
      body: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          buildSectionHeader('Display'),
          Padding(
            padding: const EdgeInsets.only(bottom: 8),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
              decoration: AppTheme.glassBox(borderRadius: 14),
              child: Row(children: [
                buildIconBox(Icons.text_fields_rounded, AppTheme.cyanNeon),
                const SizedBox(width: 12),
                Expanded(child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  const Text('Font Size', style: TextStyle(color: AppTheme.textMain, fontWeight: FontWeight.w600, fontSize: 14)),
                  Text('${_fontSize.round()}px', style: const TextStyle(color: AppTheme.textMuted, fontSize: 12)),
                ])),
                SizedBox(
                  width: 130,
                  child: Slider(
                    value: _fontSize, min: 12, max: 20, divisions: 4,
                    activeColor: AppTheme.primary, inactiveColor: AppTheme.surfaceLight,
                    onChanged: (v) => setState(() => _fontSize = v),
                  ),
                ),
              ]),
            ),
          ),
          buildNavTile(
            icon: Icons.wallpaper_rounded, color: AppTheme.roseNeon,
            title: 'Chat Wallpaper', subtitle: _wallpaper,
            onTap: _showWallpaperPicker,
          ),
          const SizedBox(height: 16),
          buildSectionHeader('Messaging'),
          buildSwitchTile(
            icon: Icons.send_rounded, color: AppTheme.primary,
            title: 'Enter Key Sends Message', subtitle: 'Press Enter to send instead of newline',
            value: _enterToSend, onChanged: (v) => setState(() => _enterToSend = v),
          ),
          buildSwitchTile(
            icon: Icons.done_all_rounded, color: AppTheme.emeraldNeon,
            title: 'Read Receipts', subtitle: 'Show double tick when message is read',
            value: _readReceipts, onChanged: (v) => setState(() => _readReceipts = v),
          ),
          const SizedBox(height: 16),
          buildSectionHeader('Media'),
          buildSwitchTile(
            icon: Icons.download_rounded, color: AppTheme.cyanNeon,
            title: 'Auto-Download Media', subtitle: 'Automatically save images and videos',
            value: _mediaAutoDownload, onChanged: (v) => setState(() => _mediaAutoDownload = v),
          ),
          buildNavTile(
            icon: Icons.cleaning_services_rounded, color: AppTheme.roseNeon,
            title: 'Clear Chat Cache', subtitle: 'Free up storage used by media',
            onTap: () => ScaffoldMessenger.of(context).showSnackBar(
              SnackBar(
                backgroundColor: AppTheme.surfaceLight,
                behavior: SnackBarBehavior.floating,
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                content: const Text('Cache cleared successfully', style: TextStyle(color: AppTheme.textMain)),
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _showWallpaperPicker() => showModalBottomSheet(
        context: context,
        backgroundColor: AppTheme.surfaceLight,
        shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
        builder: (_) => Padding(
          padding: const EdgeInsets.all(20),
          child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
            const Text('Select Wallpaper', style: TextStyle(color: AppTheme.textMain, fontWeight: FontWeight.bold, fontSize: 16)),
            const SizedBox(height: 12),
            ..._wallpapers.map((w) => ListTile(
                  title: Text(w, style: const TextStyle(color: AppTheme.textMain)),
                  trailing: _wallpaper == w ? const Icon(Icons.check_rounded, color: AppTheme.primary) : null,
                  onTap: () { setState(() => _wallpaper = w); Navigator.pop(context); },
                )),
          ]),
        ),
      );
}
