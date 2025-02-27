import 'package:flutter/material.dart';
import 'package:flutter_svg/svg.dart';
import 'package:geonotes/auth/providers/auth_provider.dart';
import 'package:geonotes/auth/widgets/auth_button.dart';
import 'package:geonotes/auth/widgets/auth_text_field.dart';
import 'package:provider/provider.dart';

class AuthLoginPage extends StatefulWidget {
  const AuthLoginPage({super.key});

  @override
  _AuthLoginPageState createState() => _AuthLoginPageState();
}

class _AuthLoginPageState extends State<AuthLoginPage> {
  final TextEditingController _emailController = TextEditingController();
  final TextEditingController _passwordController = TextEditingController();

  @override
  Widget build(BuildContext context) {
    final authProvider = Provider.of<AuthProvider>(context, listen: false);

    return Scaffold(
      body: Padding(
        padding: const EdgeInsets.all(20.0),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.spaceEvenly,
          children: [
            // Title
            Column(
              children: [
                SizedBox(height: 28),
                Row(
                  children: [
                    Text(
                      "Geonotes",
                      style: TextStyle(
                          fontSize: 40,
                          fontFamily: "poppins",
                          fontWeight: FontWeight.normal,
                          color: Colors.black),
                    ),
                    SizedBox(width: 16),
                    SvgPicture.asset(
                      'assets/svg/logo.svg',
                      height: 50,
                      width: 50,
                    ),
                  ],
                ),
                SizedBox(height: 20),
                SvgPicture.asset(
                  "assets/svg/login.svg",
                  height: 200,
                ),
                SizedBox(height: 28),
                AuthTextField(
                  controller: _emailController,
                  inputText: "Email",
                ),
                SizedBox(height: 20),
                AuthTextField(
                  controller: _passwordController,
                  inputText: "Password",
                  isPassword: true,
                ),
                SizedBox(height: 4),
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    SizedBox(width: 0),
                    Text(
                      "Forget Password",
                      style: TextStyle(color: Colors.green),
                    )
                  ],
                ),
                SizedBox(height: 26),
              ],
            ),
            Column(
              children: [
                AuthButton(
                  text: "Login",
                  onTap: () async {
                    try {
                      await authProvider.signInWithEmailAndPassword(
                        _emailController.text,
                        _passwordController.text,
                      );
                      Navigator.pushReplacementNamed(context, '/homepage');
                    } catch (e) {
                      print(e);
                      // Handle error (e.g., show a snackbar or dialog)
                    }
                  },
                ),
                SizedBox(height: 16),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 12.0),
                  child: Row(
                    children: [
                      Expanded(
                        child: Divider(
                          color: Colors.black45,
                          thickness: 1,
                        ),
                      ),
                      SizedBox(width: 4),
                      Text(
                        "or",
                        style: TextStyle(
                            fontSize: 14,
                            fontFamily: 'Poppins',
                            color: Colors.black45),
                      ),
                      SizedBox(width: 4),
                      Expanded(
                        child: Divider(
                          color: Colors.black45,
                          thickness: 1,
                        ),
                      ),
                    ],
                  ),
                ),
                SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Container(
                        decoration: BoxDecoration(
                            shape: BoxShape.circle, color: Colors.blue[100]),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: SvgPicture.asset('assets/svg/facebook.svg',
                              height: 40),
                        )),
                    SizedBox(width: 16),
                    InkWell(
                      onTap: () async {
                        try {
                          await authProvider.signInWithGoogle();
                          Navigator.pushReplacementNamed(context, '/homepage');
                        } catch (e) {
                          print(e);
                        }
                      },
                      child: Container(
                          decoration: BoxDecoration(
                              shape: BoxShape.circle, color: Colors.black12),
                          child: Padding(
                            padding: const EdgeInsets.all(12.0),
                            child: SvgPicture.asset('assets/svg/google.svg',
                                height: 40),
                          )),
                    ),
                  ],
                ),
                SizedBox(height: 16),
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    Text("Not a Member?"),
                    SizedBox(width: 8),
                    InkWell(
                      onTap: () {
                        Navigator.pushNamed(context, '/signup');
                      },
                      child: Text(
                        "Register Now",
                        style: TextStyle(
                            color: Colors.green,
                            fontWeight: FontWeight.bold,
                            fontFamily: 'Poppins'),
                      ),
                    )
                  ],
                )
              ],
            )
          ],
        ),
      ),
    );
  }
}
