import 'package:flutter/material.dart';
import '../../theme/app_theme.dart';

/// Shared AppBar used across all Settings sub-pages
AppBar buildSettingsAppBar(BuildContext context, String title) {
  return AppBar(
    backgroundColor: AppTheme.surface,
    elevation: 0,
    leading: IconButton(
      icon: const Icon(Icons.arrow_back_ios_new_rounded,
          color: AppTheme.textMain, size: 20),
      onPressed: () => Navigator.of(context).pop(),
    ),
    title: Text(title,
        style: const TextStyle(
            color: AppTheme.textMain,
            fontWeight: FontWeight.w700,
            fontSize: 18)),
    bottom: PreferredSize(
      preferredSize: const Size.fromHeight(1),
      child: Container(height: 1, color: AppTheme.borderGlass),
    ),
  );
}

/// Reusable glass-style switch tile
Widget buildSwitchTile({
  required IconData icon,
  required Color color,
  required String title,
  required String subtitle,
  required bool value,
  required ValueChanged<bool> onChanged,
}) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
      decoration: AppTheme.glassBox(borderRadius: 14),
      child: Row(children: [
        buildIconBox(icon, color),
        const SizedBox(width: 12),
        Expanded(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              Text(title,
                  style: const TextStyle(
                      color: AppTheme.textMain,
                      fontWeight: FontWeight.w600,
                      fontSize: 14)),
              Text(subtitle,
                  style: const TextStyle(
                      color: AppTheme.textMuted, fontSize: 12)),
            ])),
        Switch(
          value: value,
          onChanged: onChanged,
          activeThumbColor: Colors.white,
          activeTrackColor: AppTheme.primary,
          inactiveTrackColor: AppTheme.surfaceLight,
        ),
      ]),
    ),
  );
}

/// Reusable nav tile (tappable row)
Widget buildNavTile({
  required IconData icon,
  required Color color,
  required String title,
  required String subtitle,
  required VoidCallback onTap,
}) {
  return Padding(
    padding: const EdgeInsets.only(bottom: 8),
    child: Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(14),
        child: Container(
          padding:
              const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
          decoration: AppTheme.glassBox(borderRadius: 14),
          child: Row(children: [
            buildIconBox(icon, color),
            const SizedBox(width: 12),
            Expanded(
                child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
              Text(title,
                  style: const TextStyle(
                      color: AppTheme.textMain,
                      fontWeight: FontWeight.w600,
                      fontSize: 14)),
              Text(subtitle,
                  style: const TextStyle(
                      color: AppTheme.textMuted, fontSize: 12)),
            ])),
            const Icon(Icons.chevron_right_rounded,
                color: AppTheme.textMuted),
          ]),
        ),
      ),
    ),
  );
}

Widget buildIconBox(IconData icon, Color color) => Container(
      width: 38,
      height: 38,
      decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(10)),
      child: Icon(icon, color: color, size: 20),
    );

Widget buildSectionHeader(String title) => Padding(
      padding: const EdgeInsets.only(bottom: 8),
      child: Text(title,
          style: const TextStyle(
              color: AppTheme.primaryLight,
              fontSize: 12,
              fontWeight: FontWeight.w700,
              letterSpacing: 0.8)),
    );
