import 'package:flutter/material.dart';
import '../theme/app_theme.dart';

class AvatarWidget extends StatelessWidget {
  final String name;
  final bool isOnline;
  final double size;

  const AvatarWidget({
    super.key,
    required this.name,
    required this.isOnline,
    this.size = 48,
  });

  @override
  Widget build(BuildContext context) {
    return Stack(
      children: [
        Container(
          width: size,
          height: size,
          decoration: const BoxDecoration(
            shape: BoxShape.circle,
            gradient: AppTheme.avatarGlowGradient,
          ),
          padding: const EdgeInsets.all(2),
          child: CircleAvatar(
            backgroundColor: AppTheme.surfaceLight,
            child: Text(
              name.isNotEmpty ? name[0].toUpperCase() : '?',
              style: TextStyle(
                color: AppTheme.textMain,
                fontWeight: FontWeight.bold,
                fontSize: size * 0.35,
              ),
            ),
          ),
        ),
        if (isOnline)
          Positioned(
            bottom: 1,
            right: 1,
            child: Container(
              width: size * 0.26,
              height: size * 0.26,
              decoration: BoxDecoration(
                color: AppTheme.emeraldNeon,
                shape: BoxShape.circle,
                border:
                    Border.all(color: AppTheme.background, width: 2),
              ),
            ),
          ),
      ],
    );
  }
}
