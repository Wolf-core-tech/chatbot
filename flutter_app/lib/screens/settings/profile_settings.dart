import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'settings_helpers.dart';

class ProfileSettingsPage extends StatefulWidget {
  const ProfileSettingsPage({super.key});
  @override
  State<ProfileSettingsPage> createState() => _ProfileSettingsPageState();
}

class _ProfileSettingsPageState extends State<ProfileSettingsPage> {
  final _nameCtrl = TextEditingController(text: 'Your Name');
  final _bioCtrl = TextEditingController(text: 'Hey there! I am using PulseChat.');
  final _emailCtrl = TextEditingController(text: 'you@gmail.com');
  bool _saved = false;

  @override
  void dispose() {
    _nameCtrl.dispose();
    _bioCtrl.dispose();
    _emailCtrl.dispose();
    super.dispose();
  }

  void _save() {
    setState(() => _saved = true);
    Future.delayed(const Duration(seconds: 2), () {
      if (mounted) setState(() => _saved = false);
    });
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: buildSettingsAppBar(context, 'Profile'),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Center(
              child: Stack(
                children: [
                  Container(
                    width: 100,
                    height: 100,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      gradient: AppTheme.avatarGlowGradient,
                    ),
                    padding: const EdgeInsets.all(3),
                    child: const CircleAvatar(
                      backgroundColor: AppTheme.surfaceLight,
                      child: Text('Y',
                          style: TextStyle(color: AppTheme.textMain, fontSize: 36, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  Positioned(
                    bottom: 2,
                    right: 2,
                    child: Container(
                      width: 30,
                      height: 30,
                      decoration: BoxDecoration(
                        gradient: const LinearGradient(colors: [AppTheme.primary, AppTheme.cyanNeon]),
                        shape: BoxShape.circle,
                        border: Border.all(color: AppTheme.background, width: 2),
                      ),
                      child: const Icon(Icons.camera_alt_rounded, color: Colors.white, size: 16),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 8),
            const Text('Tap to change photo', style: TextStyle(color: AppTheme.textMuted, fontSize: 12)),
            const SizedBox(height: 28),
            _field(label: 'Display Name', ctrl: _nameCtrl, icon: Icons.person_rounded),
            const SizedBox(height: 14),
            _field(label: 'Email Address', ctrl: _emailCtrl, icon: Icons.email_rounded, readOnly: true),
            const SizedBox(height: 14),
            _field(label: 'About / Bio', ctrl: _bioCtrl, icon: Icons.info_outline_rounded, maxLines: 3),
            const SizedBox(height: 28),
            SizedBox(
              width: double.infinity,
              child: DecoratedBox(
                decoration: BoxDecoration(
                  gradient: AppTheme.primaryGradient,
                  borderRadius: BorderRadius.circular(14),
                ),
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: Colors.transparent,
                    shadowColor: Colors.transparent,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  onPressed: _save,
                  icon: Icon(_saved ? Icons.check_rounded : Icons.save_rounded, color: Colors.white),
                  label: Text(_saved ? 'Saved!' : 'Save Profile',
                      style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 15)),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _field({required String label, required TextEditingController ctrl, required IconData icon, bool readOnly = false, int maxLines = 1}) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(color: AppTheme.primaryLight, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.5)),
        const SizedBox(height: 6),
        Container(
          decoration: AppTheme.glassBox(borderRadius: 12),
          child: TextField(
            controller: ctrl,
            readOnly: readOnly,
            maxLines: maxLines,
            style: const TextStyle(color: AppTheme.textMain, fontSize: 14),
            decoration: InputDecoration(
              prefixIcon: Icon(icon, color: AppTheme.textMuted, size: 20),
              border: InputBorder.none,
              contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            ),
          ),
        ),
      ],
    );
  }
}
