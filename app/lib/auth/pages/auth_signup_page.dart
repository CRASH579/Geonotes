import 'package:flutter/material.dart';
import 'package:flutter/widgets.dart';
import 'package:flutter_svg/svg.dart';
import 'package:geonotes/auth/widgets/auth_button.dart';
import 'package:geonotes/auth/widgets/auth_text_field.dart';

class AuthSignupPage extends StatelessWidget {
  const AuthSignupPage({super.key});

  @override
  Widget build(BuildContext context) {
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
                    ),
                  ],
                ),
                SizedBox(height: 20),
                SvgPicture.asset(
                  "assets/svg/signup.svg",
                  height: 200,
                ),
                SizedBox(height: 28),
                AuthTextField(
                  inputText: "Username",
                ),
                SizedBox(height: 20),
                AuthTextField(
                  inputText: "Email",
                ),
                SizedBox(height: 20),
                AuthTextField(
                  inputText: "Password",
                ),
                SizedBox(height: 4),
                SizedBox(height: 26),
              ],
            ),
            Column(
              children: [
                AuthButton(
                  text: "Sign Up",
                  onTap: () {},
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
                    Container(
                        decoration: BoxDecoration(
                            shape: BoxShape.circle, color: Colors.black12),
                        child: Padding(
                          padding: const EdgeInsets.all(12.0),
                          child: SvgPicture.asset('assets/svg/google.svg',
                              height: 40),
                        )),
                  ],
                ),
              ],
            )

            // SVG
            // username
            // password
            // forgot password
            // login button
            // divider
            // login with facebook and google
            // not a member
          ],
        ),
      ),
    );
  }
}
