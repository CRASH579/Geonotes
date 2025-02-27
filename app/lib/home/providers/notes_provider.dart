import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:geonotes/home/model/note_model.dart';

class NotesProvider with ChangeNotifier {
  Position? _currentPosition;
  List<Note> _allNotes = [];
  List<Note> _nearbyNotes = [];

  Position? get currentPosition => _currentPosition;
  List<Note> get allNotes => _allNotes;
  List<Note> get nearbyNotes => _nearbyNotes;

  Future<void> getCurrentLocation() async {
    bool serviceEnabled;
    LocationPermission permission;
    serviceEnabled = await Geolocator.isLocationServiceEnabled();
    if (!serviceEnabled) {
      return Future.error('Location services are disabled.');
    }
    permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
      if (permission == LocationPermission.denied) {
        return Future.error('Location permissions are denied');
      }
    }
    if (permission == LocationPermission.deniedForever) {
      return Future.error(
          'Location permissions are permanently denied, we cannot request permissions.');
    }
    Position position = await Geolocator.getCurrentPosition();
    _currentPosition = position;
    notifyListeners();
  }

  Future<void> fetchAllNotes() async {
    QuerySnapshot snapshot =
        await FirebaseFirestore.instance.collection('notes').get();

    List<Note> notes = snapshot.docs.map((doc) {
      Map<String, dynamic> data = doc.data() as Map<String, dynamic>;
      GeoPoint geoPoint = doc['location'];
      return Note(
          text: data.containsKey('text') ? data['text'] : '',
          timestamp: (data['timestamp'] as Timestamp).toDate(),
          location: Position(
              longitude: geoPoint.longitude,
              latitude: geoPoint.latitude,
              timestamp: DateTime.now(),
              accuracy: 0,
              altitude: 0,
              altitudeAccuracy: 0,
              heading: 0,
              headingAccuracy: 0,
              speed: 0,
              speedAccuracy: 0));
    }).toList();
    _allNotes = notes;
    notifyListeners();
  }

  Future<void> fetchNearbyNotes() async {
    await getCurrentLocation();
    await fetchAllNotes();
    if (_currentPosition != null) {
      _nearbyNotes = _allNotes.where((note) {
        double distanceInMeters = Geolocator.distanceBetween(
          _currentPosition!.latitude,
          _currentPosition!.longitude,
          note.location.latitude,
          note.location.longitude,
        );
        return distanceInMeters <= 15000; // Fetch notes within 15km
      }).toList();

      _nearbyNotes.sort((a, b) {
        double distanceA = Geolocator.distanceBetween(
          _currentPosition!.latitude,
          _currentPosition!.longitude,
          a.location.latitude,
          a.location.longitude,
        );
        double distanceB = Geolocator.distanceBetween(
          _currentPosition!.latitude,
          _currentPosition!.longitude,
          b.location.latitude,
          b.location.longitude,
        );
        return distanceA.compareTo(distanceB);
      });
      notifyListeners();
    }
  }

  Future<void> addNote({
    required String text,
    required Position location,
  }) async {
    await FirebaseFirestore.instance.collection('notes').add({
      'text': text,
      'location': GeoPoint(location.latitude, location.longitude),
      'timestamp': FieldValue.serverTimestamp(),
    });
    await fetchNearbyNotes();
  }

  void updatePosition(Position position) {
    _currentPosition = position;
    notifyListeners();
  }
}
