import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:flutter/services.dart';
import 'package:geonotes/auth/pages/auth_login_page.dart';
import 'package:geonotes/auth/pages/auth_signup_page.dart';
import 'package:geonotes/auth/providers/auth_provider.dart';
import 'package:geonotes/home/providers/add_note_provider.dart';
import 'package:geonotes/home/providers/notes_provider.dart';
import 'package:geonotes/home/views/home_page.dart';
import 'package:geonotes/splash/providers/splash_page_provider.dart';
import 'package:geonotes/splash/views/splash_page.dart';
import 'package:provider/provider.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  SystemChrome.setEnabledSystemUIMode(SystemUiMode.immersiveSticky);
  SystemChrome.setSystemUIChangeCallback((systemOverlaysAreVisible) async {
    await Future.delayed(const Duration(seconds: 1));
    SystemChrome.restoreSystemUIOverlays();
  });
  runApp(MultiProvider(providers: [
    ChangeNotifierProvider(create: (context) => NotesProvider()),
    ChangeNotifierProvider(create: (context) => AuthProvider()),
    ChangeNotifierProvider(create: (context) => AddNoteProvider()),
    ChangeNotifierProvider(create: (context) => SplashPageProvider()),
  ], child: const MyApp()));
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'GeoNotes',
      theme: ThemeData(
        primarySwatch: Colors.blueGrey,
        visualDensity: VisualDensity.adaptivePlatformDensity,
      ),
      home: const SplashPage(),
      routes: {
        '/login': (context) => const AuthLoginPage(),
        '/signup': (context) => const AuthSignupPage(),
        '/splashpage': (context) => const SplashPage(),
        '/homepage': (context) => const HomePage(),
        // '/mapspage': (context) => const MapsPage(),
      },
    );
  }
}
