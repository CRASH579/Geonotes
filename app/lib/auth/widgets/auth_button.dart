import 'package:flutter/material.dart';
import 'package:geonotes/utils/styles.dart';

class AuthButton extends StatelessWidget {
  final String text;
  final void Function()? onTap;

  const AuthButton({super.key, required this.text, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return InkWell(
      onTap: onTap,
      child: Expanded(
        child: Container(
          width: double.infinity,
          decoration: BoxDecoration(
              color: Styles.primaryColor,
              borderRadius: BorderRadius.circular(100)),
          child: Padding(
            padding: const EdgeInsets.symmetric(vertical: 14.0),
            child: Center(
              child: Text(
                text,
                style: TextStyle(
                    color: Colors.black, fontSize: 14, fontFamily: 'Poppins'),
              ),
            ),
          ),
        ),
      ),
    );
  }
}
