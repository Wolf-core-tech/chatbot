import 'package:flutter/material.dart';
import '../theme/app_theme.dart';
import '../data/contacts_data.dart';
import '../widgets/avatar_widget.dart';

class ContactsTab extends StatefulWidget {
  const ContactsTab({super.key});

  @override
  State<ContactsTab> createState() => ContactsTabState();
}

class ContactsTabState extends State<ContactsTab> {
  String _searchQuery = '';

  List<DemoContact> get _filtered => demoContacts
      .where((c) =>
          c.originalName
              .toLowerCase()
              .contains(_searchQuery.toLowerCase()) ||
          c.email.toLowerCase().contains(_searchQuery.toLowerCase()) ||
          NicknameStore.getNickname(c.id)
              .toLowerCase()
              .contains(_searchQuery.toLowerCase()))
      .toList();

  void _showNicknameDialog(DemoContact contact) {
    final controller =
        TextEditingController(text: NicknameStore.getNickname(contact.id));

    showDialog(
      context: context,
      barrierColor: Colors.black.withValues(alpha: 0.7),
      builder: (ctx) => AlertDialog(
        backgroundColor: AppTheme.surfaceLight,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(20),
          side: const BorderSide(color: AppTheme.borderGlass),
        ),
        title: Row(
          children: [
            const Icon(Icons.edit_rounded,
                color: AppTheme.primaryLight, size: 20),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                'Nickname for\n${contact.originalName}',
                style: const TextStyle(
                    color: AppTheme.textMain,
                    fontSize: 15,
                    fontWeight: FontWeight.w700),
              ),
            ),
          ],
        ),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'This nickname replaces the contact name only on your device.',
              style: TextStyle(color: AppTheme.textMuted, fontSize: 12),
            ),
            const SizedBox(height: 14),
            Container(
              decoration: AppTheme.glassBox(borderRadius: 12),
              child: TextField(
                controller: controller,
                autofocus: true,
                style: const TextStyle(
                    color: AppTheme.textMain, fontSize: 14),
                decoration: InputDecoration(
                  hintText: contact.originalName,
                  hintStyle: const TextStyle(
                      color: AppTheme.textMuted, fontSize: 14),
                  border: InputBorder.none,
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 14, vertical: 12),
                  suffixIcon: IconButton(
                    icon: const Icon(Icons.clear,
                        color: AppTheme.textMuted, size: 18),
                    onPressed: () => controller.clear(),
                  ),
                ),
              ),
            ),
          ],
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: const Text('Cancel',
                style: TextStyle(color: AppTheme.textMuted)),
          ),
          // Remove nickname
          if (NicknameStore.getNickname(contact.id).isNotEmpty)
            TextButton(
              onPressed: () {
                NicknameStore.setNickname(contact.id, '');
                setState(() {});
                Navigator.pop(ctx);
                _showSnack('Nickname removed for ${contact.originalName}');
              },
              child: const Text('Remove',
                  style: TextStyle(color: AppTheme.roseNeon)),
            ),
          ElevatedButton(
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.primary,
              foregroundColor: Colors.white,
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(10)),
            ),
            onPressed: () {
              NicknameStore.setNickname(contact.id, controller.text);
              setState(() {});
              Navigator.pop(ctx);
              final saved = controller.text.trim();
              if (saved.isNotEmpty) {
                _showSnack('Nickname set: "$saved" for ${contact.originalName}');
              }
            },
            child: const Text('Save'),
          ),
        ],
      ),
    );
  }

  void _showSnack(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        backgroundColor: AppTheme.surfaceLight,
        behavior: SnackBarBehavior.floating,
        shape:
            RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        content: Text(msg,
            style: const TextStyle(color: AppTheme.textMain, fontSize: 13)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return SafeArea(
      child: Column(
        children: [
          // ── Header ──────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 14, 16, 8),
            child: Row(
              children: [
                const Text(
                  'Contacts',
                  style: TextStyle(
                    fontSize: 24,
                    fontWeight: FontWeight.w800,
                    color: AppTheme.textMain,
                    letterSpacing: -0.5,
                  ),
                ),
                const Spacer(),
                Container(
                  width: 38,
                  height: 38,
                  decoration: BoxDecoration(
                    color: AppTheme.surfaceLight,
                    shape: BoxShape.circle,
                    border: Border.all(color: AppTheme.borderGlass),
                  ),
                  child: const Icon(Icons.person_add_alt_1_rounded,
                      color: AppTheme.textMuted, size: 20),
                ),
              ],
            ),
          ),

          // ── Search ─────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 10),
            child: Container(
              decoration: AppTheme.glassBox(borderRadius: 14),
              child: TextField(
                onChanged: (v) => setState(() => _searchQuery = v),
                style: const TextStyle(
                    color: AppTheme.textMain, fontSize: 14),
                decoration: const InputDecoration(
                  hintText: 'Search contacts…',
                  hintStyle:
                      TextStyle(color: AppTheme.textMuted, fontSize: 14),
                  prefixIcon: Icon(Icons.search,
                      color: AppTheme.textMuted, size: 20),
                  border: InputBorder.none,
                  contentPadding: EdgeInsets.symmetric(vertical: 12),
                ),
              ),
            ),
          ),

          // ── Hint banner ────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 8),
            child: Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(10),
                border: Border.all(
                    color: AppTheme.primary.withValues(alpha: 0.3)),
              ),
              child: const Row(
                children: [
                  Icon(Icons.info_outline_rounded,
                      color: AppTheme.primaryLight, size: 16),
                  SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      'Tap a contact and press ✏️ to set a custom nickname visible only to you.',
                      style: TextStyle(
                          color: AppTheme.primaryLight, fontSize: 12),
                    ),
                  ),
                ],
              ),
            ),
          ),

          // ── Contact list ───────────────────────────────────────
          Expanded(
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              itemCount: _filtered.length,
              separatorBuilder: (_, __) => Divider(
                  color: AppTheme.borderGlass, height: 1, indent: 76),
              itemBuilder: (context, i) {
                final c = _filtered[i];
                final nick = NicknameStore.getNickname(c.id);
                final display =
                    NicknameStore.displayName(c.id, c.originalName);

                return ListTile(
                  contentPadding: const EdgeInsets.symmetric(
                      horizontal: 4, vertical: 6),
                  leading: AvatarWidget(
                      name: display, isOnline: c.isOnline, size: 52),
                  title: Row(
                    children: [
                      Text(
                        display,
                        style: const TextStyle(
                            color: AppTheme.textMain,
                            fontWeight: FontWeight.w600,
                            fontSize: 15),
                      ),
                      if (nick.isNotEmpty) ...[
                        const SizedBox(width: 6),
                        Container(
                          padding: const EdgeInsets.symmetric(
                              horizontal: 6, vertical: 2),
                          decoration: BoxDecoration(
                            gradient: AppTheme.primaryGradient,
                            borderRadius: BorderRadius.circular(6),
                          ),
                          child: const Text(
                            'NICKNAME',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 9,
                                fontWeight: FontWeight.bold,
                                letterSpacing: 0.5),
                          ),
                        ),
                      ],
                    ],
                  ),
                  subtitle: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      if (nick.isNotEmpty)
                        Text(
                          'Real name: ${c.originalName}',
                          style: const TextStyle(
                              color: AppTheme.textMuted, fontSize: 11),
                        ),
                      if (c.email.isNotEmpty)
                        Text(
                          c.email,
                          style: const TextStyle(
                              color: AppTheme.cyanNeon, fontSize: 12),
                        ),
                      Text(
                        c.bio,
                        style: const TextStyle(
                            color: AppTheme.textMuted, fontSize: 12),
                      ),
                    ],
                  ),
                  trailing: Row(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      // Online dot
                      if (c.isOnline)
                        Container(
                          width: 8,
                          height: 8,
                          margin: const EdgeInsets.only(right: 8),
                          decoration: const BoxDecoration(
                              color: AppTheme.emeraldNeon,
                              shape: BoxShape.circle),
                        ),
                      // Edit nickname button
                      GestureDetector(
                        onTap: () => _showNicknameDialog(c),
                        child: Container(
                          padding: const EdgeInsets.all(8),
                          decoration: BoxDecoration(
                            color: AppTheme.primary.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(10),
                            border: Border.all(
                                color: AppTheme.primary
                                    .withValues(alpha: 0.3)),
                          ),
                          child: const Icon(Icons.edit_rounded,
                              color: AppTheme.primaryLight, size: 17),
                        ),
                      ),
                    ],
                  ),
                  onTap: () {},
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
