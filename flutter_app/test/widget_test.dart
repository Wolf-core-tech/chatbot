import 'package:flutter/material.dart';
import 'package:flutter_app/main.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  testWidgets('PulseChat smoke test', (WidgetTester tester) async {
    await tester.pumpWidget(const PulseChatApp());
    expect(find.text('PulseChat'), findsOneWidget);
  });
}
