import 'package:flutter/material.dart';

class AuthTextField extends StatelessWidget {
  final String inputText;
  final bool isPassword;
  final TextEditingController? controller;
  final TextInputType keyboardType;
  final String? Function(String?)? validator;
  final IconData? icon;

  const AuthTextField({
    super.key,
    required this.inputText,
    this.isPassword = false,
    this.controller,
    this.keyboardType = TextInputType.text,
    this.validator,
    this.icon,
  });

  @override
  Widget build(BuildContext context) {
    return TextFormField(
      controller: controller,
      obscureText: isPassword,
      keyboardType: keyboardType,
      validator: validator,
      decoration: InputDecoration(
        labelText: inputText,
        labelStyle: TextStyle(
          color: Colors.black54,
          fontWeight: FontWeight.w200,
          fontFamily: 'Lexend',
          // fontSize: 20
        ),
        floatingLabelStyle: TextStyle(
          color: Colors.black54,
        ),
        hintStyle: TextStyle(
          color: Colors.black54,
          fontWeight: FontWeight.w200,
          fontFamily: 'Lexend',
          // fontSize: 20
        ),
        focusedBorder: OutlineInputBorder(
            borderSide: BorderSide(
              color: Colors.black54,
            ),
            borderRadius: BorderRadius.circular(12)),
        enabledBorder: OutlineInputBorder(
            borderSide: BorderSide(
              color: Colors.black54,
            ),
            borderRadius: BorderRadius.circular(12)),
        border: OutlineInputBorder(
          borderSide: BorderSide(
            color: Colors.black54,
          ),
          borderRadius: BorderRadius.circular(12),
        ),
        errorBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Colors.red),
        ),
        hintText: inputText,
        suffixIcon: icon != null
            ? Icon(
                icon,
                color: Colors.black54,
              )
            : null,
      ),
    );
  }
}
