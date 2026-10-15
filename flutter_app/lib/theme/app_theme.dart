import 'package:flutter/material.dart';

class AppTheme {
  // Cyberpunk / Cosmic Glass Color Palette
  static const Color background = Color(0xFF0A0D14);
  static const Color surface = Color(0xFF131927);
  static const Color surfaceLight = Color(0xFF1E2638);
  static const Color cardGlass = Color(0x991E2638);
  static const Color borderGlass = Color(0x338B5CF6);

  // Accents
  static const Color primary = Color(0xFF8B5CF6); // Electric Violet
  static const Color primaryLight = Color(0xFFA78BFA);
  static const Color cyanNeon = Color(0xFF06B6D4); // Cyan Glow
  static const Color roseNeon = Color(0xFFEC4899); // Rose Pink
  static const Color emeraldNeon = Color(0xFF10B981); // Online Emerald

  // Text
  static const Color textMain = Color(0xFFF3F4F6);
  static const Color textMuted = Color(0xFF9CA3AF);
  static const Color textDark = Color(0xFF060911);

  // Gradients
  static const LinearGradient primaryGradient = LinearGradient(
    colors: [Color(0xFF8B5CF6), Color(0xFF06B6D4)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient sentBubbleGradient = LinearGradient(
    colors: [Color(0xFF7C3AED), Color(0xFF4C1D95)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static const LinearGradient avatarGlowGradient = LinearGradient(
    colors: [Color(0xFFEC4899), Color(0xFF8B5CF6), Color(0xFF06B6D4)],
    begin: Alignment.topLeft,
    end: Alignment.bottomRight,
  );

  static ThemeData get darkTheme {
    return ThemeData(
      brightness: Brightness.dark,
      scaffoldBackgroundColor: background,
      primaryColor: primary,
      colorScheme: const ColorScheme.dark(
        primary: primary,
        secondary: cyanNeon,
        surface: surface,
        error: roseNeon,
      ),
      fontFamily: 'Roboto',
      appBarTheme: const AppBarTheme(
        backgroundColor: surface,
        elevation: 0,
        centerTitle: false,
      ),
      bottomNavigationBarTheme: const BottomNavigationBarThemeData(
        backgroundColor: Colors.transparent,
        elevation: 0,
      ),
    );
  }

  static BoxDecoration glassBox({
    Color? color,
    Color? borderColor,
    double borderRadius = 18.0,
  }) {
    return BoxDecoration(
      color: color ?? cardGlass,
      borderRadius: BorderRadius.circular(borderRadius),
      border: Border.all(color: borderColor ?? borderGlass, width: 1.2),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withValues(alpha: 0.3),
          blurRadius: 16,
          offset: const Offset(0, 6),
        ),
      ],
    );
  }
}
