import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:geonotes/home/providers/add_note_provider.dart';
import 'package:geonotes/home/providers/notes_provider.dart';
import 'package:geonotes/utils/styles.dart';
import 'package:provider/provider.dart';

class AddNoteDialog extends StatelessWidget {
  const AddNoteDialog({super.key});

  @override
  Widget build(BuildContext context) {
    final GlobalKey<FormState> formKey = GlobalKey<FormState>();
    final addNoteProvider = Provider.of<AddNoteProvider>(context);
    return AlertDialog(
      backgroundColor: Colors.white,
      elevation: 10,
      title: const Text(
        'Add your Note',
        style: TextStyle(
            fontSize: 32,
            fontFamily: "poppins",
            fontWeight: FontWeight.normal,
            color: Colors.black),
      ),
      content: SizedBox(
        height: 200,
        width: 600,
        child: Form(
          key: formKey,
          child: TextFormField(
            expands: true,
            maxLines: null,
            minLines: null,
            textAlignVertical: TextAlignVertical.top,
            controller: addNoteProvider.titleController,
            validator: (p0) => p0!.isEmpty ? "Please enter Title" : null,
            decoration: InputDecoration(
              alignLabelWithHint: true,
              labelText: 'Title',
              labelStyle: TextStyle(
                color: Colors.black.withAlpha(150),
                fontWeight: FontWeight.w200,
                fontFamily: 'Lexend',
              ),
              floatingLabelStyle: TextStyle(
                color: Styles.primaryColor,
              ),
              hintStyle: TextStyle(
                color: Colors.black.withAlpha(180),
                fontWeight: FontWeight.w200,
                fontFamily: 'Lexend',
              ),
              focusedBorder: OutlineInputBorder(
                  borderSide: const BorderSide(
                    color: Colors.black,
                  ),
                  borderRadius: BorderRadius.circular(12)),
              enabledBorder: OutlineInputBorder(
                  borderSide: const BorderSide(
                    color: Colors.black,
                  ),
                  borderRadius: BorderRadius.circular(12)),
              border: OutlineInputBorder(
                borderSide: const BorderSide(
                  color: Colors.black,
                ),
                borderRadius: BorderRadius.circular(12),
              ),
              errorBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(12),
                borderSide: const BorderSide(color: Colors.red),
              ),
              hintText: "Title",
            ),
          ),
        ),
      ),
      actions: <Widget>[
        TextButton(
          style: TextButton.styleFrom(foregroundColor: Colors.red),
          onPressed: () {
            Navigator.of(context).pop();
          },
          child: const Text(
            'Cancel',
            style: TextStyle(fontSize: 14, fontFamily: 'Poppins'),
          ),
        ),
        TextButton(
          style: TextButton.styleFrom(foregroundColor: Colors.green),
          onPressed: () async {
            if (formKey.currentState!.validate()) {
              final notesProvider =
                  Provider.of<NotesProvider>(context, listen: false);
              Position position = await Geolocator.getCurrentPosition(
                  desiredAccuracy: LocationAccuracy.best);
              Navigator.of(context).pop();
              await notesProvider.addNote(
                text: addNoteProvider.titleController.text,
                location: position,
              );
              addNoteProvider.clearTextField();
            }
          },
          child: const Text(
            'Add',
            style: TextStyle(fontSize: 14, fontFamily: 'Poppins'),
          ),
        ),
      ],
    );
  }
}
