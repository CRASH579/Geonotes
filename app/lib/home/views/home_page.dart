import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geonotes/home/providers/add_note_provider.dart';
import 'package:geonotes/home/providers/notes_provider.dart';
import 'package:geonotes/home/widgets/note_card.dart';
import 'package:geonotes/splash/providers/splash_page_provider.dart';
import 'package:geonotes/utils/styles.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:provider/provider.dart';

class HomePage extends StatefulWidget {
  const HomePage({super.key});

  @override
  State<HomePage> createState() => _HomePageState();
}

class _HomePageState extends State<HomePage> {
  @override
  void initState() {
    super.initState();
    // Initialize data when the page is first created
    WidgetsBinding.instance.addPostFrameCallback((_) {
      Provider.of<NotesProvider>(context, listen: false).initializeData();
    });
  }

  @override
  Widget build(BuildContext context) {
    final addNoteProvider = Provider.of<AddNoteProvider>(context);
    final splashPageProvider = Provider.of<SplashPageProvider>(context);
    return Scaffold(
      backgroundColor: Colors.white,
      appBar: AppBar(
        backgroundColor: Colors.white,
        foregroundColor: Colors.white,
        surfaceTintColor: Colors.white,
        title: Padding(
          padding: const EdgeInsets.only(top: 16.0),
          child: Row(
            children: [
              const Text(
                "Geonotes",
                style: TextStyle(
                    fontSize: 40,
                    fontFamily: "poppins",
                    fontWeight: FontWeight.normal,
                    color: Colors.black),
              ),
              const SizedBox(width: 8),
              SvgPicture.asset(
                'assets/svg/logo.svg',
                height: 40,
                width: 40,
              ),
            ],
          ),
        ),
      ),
      floatingActionButton: FloatingActionButton(
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(100),
        ),
        backgroundColor: Styles.primaryColor,
        onPressed: () => addNoteProvider.showAddNoteDialog(context),
        child: const Icon(
          Icons.add,
          color: Colors.white,
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.only(top: 32.0),
        child: Consumer<NotesProvider>(
          builder: (context, notesProvider, child) {
            // notesProvider.fetchNearbyNotes();
            if (notesProvider.currentPosition == null) {
              return const Center(child: CircularProgressIndicator());
            } else if (notesProvider.nearbyNotes.isEmpty) {
              return const Center(child: Text("No notes nearby"));
            } else {
              return RefreshIndicator(
                onRefresh: () => notesProvider.fetchNearbyNotes(),
                child: ListView.builder(
                  itemCount: notesProvider.nearbyNotes.length,
                  itemBuilder: (context, index) {
                    var note = notesProvider.nearbyNotes[index];
                    double distanceInMeters = Geolocator.distanceBetween(
                      notesProvider.currentPosition!.latitude,
                      notesProvider.currentPosition!.longitude,
                      note.location.latitude,
                      note.location.longitude,
                    );

                    return InkWell(
                      onTap: () async {
                        notesProvider.latLng = LatLng(
                            note.location.latitude, note.location.longitude);
                        splashPageProvider.selectTab(1);
                        await Future.delayed(const Duration(seconds: 1), () {
                          notesProvider.latLng = null;
                        });
                      },
                      child: NoteCard(
                        note: note,
                        distanceText: distanceInMeters,
                      ),
                    );
                  },
                ),
              );
            }
          },
        ),
      ),
    );
  }
}
