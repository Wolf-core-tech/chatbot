import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';
import 'settings_helpers.dart';

class TermsScreen extends StatelessWidget {
  const TermsScreen({super.key});

  static const _sections = [
    ('1. Acceptance of Terms', 'By downloading, installing, or using PulseChat, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the application.'),
    ('2. Use of Service', 'PulseChat provides a real-time messaging service. You agree to use the service only for lawful purposes and in accordance with these terms. You must not use the service to send spam, harmful content, or violate any applicable laws.'),
    ('3. User Accounts', 'You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account. PulseChat cannot be liable for any loss or damage from your failure to comply.'),
    ('4. Privacy & Data', 'Your use of PulseChat is governed by our Privacy Policy. We collect minimal data necessary to provide the service. Messages are stored on our servers to enable message history and synchronization.'),
    ('5. Email-Based Invitations', 'PulseChat uses email as the primary method of contact identification and friend invitations. By using the invitation system, you agree that invitation emails may be sent on your behalf to contacts you specify.'),
    ('6. Intellectual Property', 'PulseChat and its original content, features, and functionality are protected by applicable intellectual property laws. You may not copy, modify, or distribute without express written permission.'),
    ('7. Limitation of Liability', 'PulseChat shall not be liable for any indirect, incidental, special, or consequential damages resulting from your use or inability to use the service.'),
    ('8. Changes to Terms', 'We reserve the right to modify these terms at any time. We will notify users of significant changes via the app or email. Continued use constitutes acceptance of the new terms.'),
    ('9. Termination', 'We reserve the right to terminate or suspend your account at our sole discretion, without notice, for conduct that violates these Terms or is harmful to other users.'),
    ('10. Contact Us', 'If you have questions about these Terms and Conditions, please contact us at support@pulsechat.app.'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      appBar: buildSettingsAppBar(context, 'Terms & Conditions'),
      body: Column(
        children: [
          Container(
            width: double.infinity,
            margin: const EdgeInsets.all(16),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              gradient: const LinearGradient(colors: [Color(0xFFF59E0B), Color(0xFFD97706)], begin: Alignment.topLeft, end: Alignment.bottomRight),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              const Row(children: [
                Icon(Icons.article_rounded, color: Colors.white, size: 22),
                SizedBox(width: 8),
                Text('Terms & Conditions', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 16)),
              ]),
              const SizedBox(height: 6),
              Text('Last updated: October 2026', style: TextStyle(color: Colors.white.withValues(alpha: 0.8), fontSize: 12)),
              const SizedBox(height: 4),
              Text('Please read these terms carefully before using PulseChat.', style: TextStyle(color: Colors.white.withValues(alpha: 0.9), fontSize: 13)),
            ]),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.fromLTRB(16, 0, 16, 24),
              itemCount: _sections.length,
              itemBuilder: (context, i) {
                final (title, content) = _sections[i];
                return Padding(
                  padding: const EdgeInsets.only(bottom: 10),
                  child: Container(
                    padding: const EdgeInsets.all(16),
                    decoration: AppTheme.glassBox(borderRadius: 14),
                    child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                      Text(title, style: const TextStyle(color: AppTheme.primaryLight, fontWeight: FontWeight.w700, fontSize: 14)),
                      const SizedBox(height: 8),
                      Text(content, style: const TextStyle(color: AppTheme.textMuted, fontSize: 13, height: 1.6)),
                    ]),
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
