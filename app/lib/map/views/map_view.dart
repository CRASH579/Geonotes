import 'dart:math';
import 'package:flutter/material.dart';
import 'package:geonotes/home/providers/notes_provider.dart';
import 'package:label_marker/label_marker.dart';
import 'package:provider/provider.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';

class MapsPage extends StatefulWidget {
  const MapsPage({super.key});

  @override
  State<MapsPage> createState() => _MapsPageState();
}

class _MapsPageState extends State<MapsPage> {
  GoogleMapController? _mapController;
  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Consumer<NotesProvider>(
        builder: (context, notesProvider, child) {
          if (notesProvider.currentPosition == null) {
            return const Center(child: CircularProgressIndicator());
          } else {
            return GoogleMap(
              onMapCreated: (controller) {
                _mapController = controller;
                if (notesProvider.latLng != null) {
                  controller.animateCamera(
                    CameraUpdate.newLatLng(notesProvider.latLng!),
                  );
                }
                // notesProvider.updatePosition(notesProvider.currentPosition!);
              },
              initialCameraPosition: CameraPosition(
                target: (notesProvider.latLng == null)
                    ? LatLng(
                        notesProvider.currentPosition!.latitude,
                        notesProvider.currentPosition!.longitude,
                      )
                    : LatLng(notesProvider.latLng!.latitude,
                        notesProvider.latLng!.longitude),
                zoom: 14.0,
              ),
              markers: notesProvider.allNotes.map((note) {
                return Marker(
                  markerId: MarkerId(note.text),
                  position: LatLng(
                    note.location.latitude,
                    note.location.longitude,
                  ),
                  infoWindow: InfoWindow(
                    title: note.text,
                    snippet: 'Note added on ${note.timestamp}',
                  ),
                  icon: BitmapDescriptor.defaultMarkerWithHue(
                    Random().nextDouble() * 360,
                  ),
                );
              }).toSet(),
              myLocationEnabled: true,
              myLocationButtonEnabled: true,
              compassEnabled: true,
              mapType: MapType.terrain,
              buildingsEnabled: true,
              zoomControlsEnabled: true,
            );
          }
        },
      ),
    );
  }

  @override
  void dispose() {
    _mapController?.dispose();
    super.dispose();
  }
}
