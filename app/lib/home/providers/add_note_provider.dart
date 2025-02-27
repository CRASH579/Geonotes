import 'package:flutter/material.dart';
import 'package:geonotes/home/widgets/add_note_dialog.dart';

class AddNoteProvider with ChangeNotifier {
  final TextEditingController titleController = TextEditingController();

  void showAddNoteDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (BuildContext context) {
        return const AddNoteDialog();
      },
    );
  }

  void clearTextField() {
    titleController.clear();
    notifyListeners();
  }

  @override
  void dispose() {
    titleController.dispose();
    super.dispose();
  }
}
