// import 'dart:math';

// import 'package:flutter/material.dart';
// import 'package:cloud_firestore/cloud_firestore.dart';
// import 'package:geolocator/geolocator.dart';
// import 'package:google_maps_flutter/google_maps_flutter.dart';
// import 'package:label_marker/label_marker.dart';

// class MapsPage extends StatefulWidget {
//   const MapsPage({super.key});

//   @override
//   _MapsPageState createState() => _MapsPageState();
// }

// class _MapsPageState extends State<MapsPage> {
//   Position? _currentPosition;
//   GoogleMapController? _mapController;
//   Set<Marker> _markers = {};
//   List<DocumentSnapshot> _nearbyNotes = [];

//   @override
//   void initState() {
//     super.initState();
//     _getCurrentLocation();
//   }

//   Future<void> _getCurrentLocation() async {
//     bool serviceEnabled;
//     LocationPermission permission;

//     // Check if location services are enabled
//     serviceEnabled = await Geolocator.isLocationServiceEnabled();
//     if (!serviceEnabled) {
//       return Future.error('Location services are disabled.');
//     }

//     // Check for location permissions
//     permission = await Geolocator.checkPermission();
//     if (permission == LocationPermission.denied) {
//       permission = await Geolocator.requestPermission();
//       if (permission == LocationPermission.denied) {
//         return Future.error('Location permissions are denied');
//       }
//     }

//     if (permission == LocationPermission.deniedForever) {
//       return Future.error(
//           'Location permissions are permanently denied, we cannot request permissions.');
//     }

//     // Get current position
//     Position position = await Geolocator.getCurrentPosition();
//     setState(() {
//       _currentPosition = position;
//     });
//     _fetchNearbyNotes();
//   }

//   Future<void> _fetchNearbyNotes() async {
//     if (_currentPosition != null) {
//       QuerySnapshot snapshot =
//           await FirebaseFirestore.instance.collection('notes').get();
//       List<DocumentSnapshot> notes = snapshot.docs;

//       // List<DocumentSnapshot> notes = snapshot.docs.where((doc) {
//       //   GeoPoint geoPoint = doc['location'];
//       //   double distanceInMeters = Geolocator.distanceBetween(
//       //       _currentPosition!.latitude,
//       //       _currentPosition!.longitude,
//       //       geoPoint.latitude,
//       //       geoPoint.longitude);

//       //   return distanceInMeters <= 10000; // Fetch notes within 1km
//       // }).toList();

//       setState(() {
//         _nearbyNotes = notes;
//         _setMarkersOnMap();
//       });
//     }
//   }
//   // Text Instead of Marker
//   // void _setMarkersOnMap() {
//   //   Set<Marker> newMarkers = {};

//   //   for (var note in _nearbyNotes) {
//   //     GeoPoint location = note['location'];
//   //     String noteText = note['text'];

//   //     LabelMarker marker = LabelMarker(
//   //         label: noteText,
//   //         markerId: MarkerId(note.id),
//   //         position: LatLng(location.latitude, location.longitude),
//   //         icon: _getMarkerColor(),
//   //         textStyle: TextStyle(fontSize: 32),
//   //         infoWindow: InfoWindow(title: noteText),
//   //         backgroundColor: Colors.black);
//   //     newMarkers.addLabelMarker(marker).then((value) {
//   //       setState(() {});
//   //     });
//   //   }

//   //   setState(() {
//   //     _markers = newMarkers;
//   //   });
//   // }

//   void _setMarkersOnMap() {
//     Set<Marker> newMarkers = {};

//     for (var note in _nearbyNotes) {
//       GeoPoint location = note['location'];
//       String noteText = note['text'];

//       Marker marker = Marker(
//         markerId: MarkerId(note.id),
//         position: LatLng(location.latitude, location.longitude),
//         icon: _getMarkerColor(),
//         infoWindow: InfoWindow(title: noteText),
//       );
//       newMarkers.add(marker);
//     }

//     setState(() {
//       _markers = newMarkers;
//     });
//   }

//   // Function to get different marker colors
//   BitmapDescriptor _getMarkerColor() {
//     // Generate a random hue value between 0 and 360
//     double randomHue = Random().nextDouble() * 360;

//     return BitmapDescriptor.defaultMarkerWithHue(randomHue);
//   }

//   @override
//   Widget build(BuildContext context) {
//     return SafeArea(
//       child: Scaffold(
//         body: _currentPosition == null
//             ? const Center(child: CircularProgressIndicator())
//             : GoogleMap(
//                 onMapCreated: (controller) {
//                   _mapController = controller;
//                 },
//                 initialCameraPosition: CameraPosition(
//                   target: LatLng(
//                       _currentPosition!.latitude, _currentPosition!.longitude),
//                   zoom: 14.0,
//                 ),
//                 markers: _markers,
//                 myLocationEnabled: true,
//                 myLocationButtonEnabled: true,
//               ),
//       ),
//     );
//   }
// }
