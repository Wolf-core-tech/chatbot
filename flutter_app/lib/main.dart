import 'package:flutter/material.dart';
import 'theme/app_theme.dart';
import 'screens/chats_tab.dart';
import 'screens/contacts_tab.dart';
import 'screens/settings_tab.dart';

void main() {
  runApp(const PulseChatApp());
}

class PulseChatApp extends StatelessWidget {
  const PulseChatApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'PulseChat',
      debugShowCheckedModeBanner: false,
      theme: AppTheme.darkTheme,
      home: const HomeScreen(),
    );
  }
}

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => HomeScreenState();
}

class HomeScreenState extends State<HomeScreen> {
  int _selectedIndex = 0;

  static const List<Widget> _pages = [
    ChatsTab(),
    ContactsTab(),
    SettingsTab(),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.background,
      body: IndexedStack(
        index: _selectedIndex,
        children: _pages,
      ),
      bottomNavigationBar: Container(
        decoration: const BoxDecoration(
          color: AppTheme.surface,
          border: Border(
            top: BorderSide(color: AppTheme.borderGlass, width: 1),
          ),
        ),
        child: NavigationBar(
          backgroundColor: Colors.transparent,
          elevation: 0,
          indicatorColor: AppTheme.primary.withValues(alpha: 0.18),
          selectedIndex: _selectedIndex,
          onDestinationSelected: (i) => setState(() => _selectedIndex = i),
          labelBehavior: NavigationDestinationLabelBehavior.alwaysShow,
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.chat_bubble_outline_rounded,
                  color: AppTheme.textMuted),
              selectedIcon: Icon(Icons.chat_bubble_rounded,
                  color: AppTheme.primaryLight),
              label: 'Chats',
            ),
            NavigationDestination(
              icon: Icon(Icons.contacts_outlined, color: AppTheme.textMuted),
              selectedIcon:
                  Icon(Icons.contacts_rounded, color: AppTheme.primaryLight),
              label: 'Contacts',
            ),
            NavigationDestination(
              icon: Icon(Icons.settings_outlined, color: AppTheme.textMuted),
              selectedIcon:
                  Icon(Icons.settings_rounded, color: AppTheme.primaryLight),
              label: 'Settings',
            ),
          ],
        ),
      ),
    );
  }
}
