import 'package:flutter/material.dart';

class NoteCard extends StatelessWidget {
  final String note;
  final double distanceText;
  const NoteCard({super.key, required this.note, required this.distanceText});

  @override
  Widget build(BuildContext context) {
    return Card(
      margin: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
      color: Colors.green[100],
      child: Padding(
        padding: const EdgeInsets.all(18.0),
        child: Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Expanded(
              child: Text(
                note,
                style: const TextStyle(
                    fontSize: 14, fontFamily: 'Poppins', color: Colors.black),
              ),
            ),
            const SizedBox(width: 8),
            Text(
              getFormattedDistance(distanceText),
              style: const TextStyle(
                  fontSize: 14, fontFamily: 'Poppins', color: Colors.black45),
            ),
          ],
        ),
      ),
    );
  }
}

String getFormattedDistance(distanceInMeters) {
  if (distanceInMeters > 999) {
    double distanceInKm = distanceInMeters / 1000;
    return "${distanceInKm.toStringAsFixed(1)} km";
  } else {
    return "${distanceInMeters.toStringAsFixed(0)} m";
  }
}
