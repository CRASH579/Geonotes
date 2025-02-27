import 'package:flutter/material.dart';
import 'package:geonotes/home/views/home_page.dart';
import 'package:geonotes/map/views/map_view.dart';
import 'package:geonotes/splash/providers/splash_page_provider.dart';
import 'package:geonotes/utils/styles.dart';
import 'package:google_nav_bar/google_nav_bar.dart';
import 'package:provider/provider.dart';

class SplashPage extends StatelessWidget {
  const SplashPage({super.key});

  @override
  Widget build(BuildContext context) {
    final splashProvider = Provider.of<SplashPageProvider>(context);
    return Scaffold(
      backgroundColor: Colors.white,
      body: _buildPage(splashProvider.selectedIndex),
      bottomNavigationBar: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 8.0, vertical: 6),
        child: Container(
          color: Colors.white,
          child: GNav(
            gap: 8,
            activeColor: Colors.white,
            color: Colors.black,
            iconSize: 24,
            padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 20),
            duration: const Duration(milliseconds: 300),
            tabBackgroundColor: Styles.primaryColor,
            tabs: const [
              GButton(
                icon: Icons.home,
                text: 'Home',
              ),
              GButton(
                icon: Icons.map,
                text: 'Maps',
              ),
              GButton(
                icon: Icons.people,
                text: 'Friends',
              ),
            ],
            selectedIndex: splashProvider.selectedIndex,
            onTabChange: (index) => splashProvider.selectTab(index),
          ),
        ),
      ),
    );
  }

  Widget _buildPage(int selectedIndex) {
    switch (selectedIndex) {
      case 0:
        return const HomePage();
      case 1:
        return const MapsPage();
      case 2:
        return const Center(child: Text('Friends Page'));
      default:
        return const HomePage();
    }
  }
}
