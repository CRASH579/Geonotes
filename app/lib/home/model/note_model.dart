import 'package:geolocator/geolocator.dart';

class Note {
  final String text;
  final DateTime timestamp;
  final Position location;

  Note({
    required this.text,
    required this.timestamp,
    required this.location,
  });
}
