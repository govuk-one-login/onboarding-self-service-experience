Feature: Users can sign in to the self-service experience

  Background:
    Given the user is on the "/sign-in" page

  Rule: The user tries to submit an email address
    Scenario: The user does not enter any characters into the Email address text field
      When they submit the email ""
      Then the error message "Enter your email address" must be displayed for the email field

    Scenario: User does not enter a valid email address
      When they submit the email "invalid-email.com"
      Then the error message "Enter an email address in the correct format, like name@example.com" must be displayed for the email field

  Rule: The user tries to submit a password
    Scenario: User doesn't enter any characters into the password field
      When they submit the email "registered@gds.gov.uk"
      Then they should be redirected to the "/sign-in/enter-password" page
      When they submit the password ""
      Then the error message "Enter your password" must be displayed for the password field

    Scenario: User enters an invalid password
      When they submit the email "password-will-be-wrong@stub.gov.uk"
      Then they should see the text "Enter your password"
      When they submit the password "Invalid-Password"
      Then the error message "Incorrect password" must be displayed for the password field

    Scenario: The user tries to log in and submits registered email but enters wrong password
      When they submit the email "password-will-be-wrong@stub.gov.uk"
      Then they should see the text "Enter your password"
      When they submit the password "WrongPa$$word"
      Then the error message "Incorrect password" must be displayed for the password field

    Scenario: The user wants to see or hide their password as they type it
      When they submit the email "registered@gds.gov.uk"
      Then they should see the text "Enter your password"
      When they toggle the "Show" link on the field "password"
      And they enter the password "PasswordIsShown"
      Then they see the toggle link "Hide" on the field "password"
      And they can see the content in the password field
      When they toggle the "Hide" link on the field "password"
      And they see the toggle link "Show" on the field "password"
      Then they can not see the content in the password field

  Rule: The user tries to sign in with account which is not registered
    Scenario: The user submits email and password but account is not registered
      When they submit the email "not-registered@gds.gov.uk"
      When they submit a valid password
      Then they should be redirected to the "/sign-in/account-not-found" page

  Rule: The user tries to reset their password
    Background:
      When they submit the email "registered@gds.gov.uk"
      Then they click on the "Forgot your password?" link
      Then they should be redirected to the "/sign-in/forgot-password" page
      Then they click the Continue button
      Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page

    Scenario: The user tries to use a password on the list of common passwords during password reset
      When they click on the forgot password link in their email
      When they submit the password "Password123"
      And they should see the text "Enter a stronger password. Do not use very common passwords like ‘password’ or a sequence of numbers."

    Scenario: The user wants to see or hide their password as they type it
      When they click on the forgot password link in their email
      Then they should see the text "Create a new password"
      When they toggle the "Show" link on the field "password"
      And they enter the password "PasswordIsShown"
      Then they see the toggle link "Hide" on the field "password"
      And they can see the content in the password field
      When they toggle the "Hide" link on the field "password"
      And they see the toggle link "Show" on the field "password"
      Then they can not see the content in the password field

    Scenario: The user resends the email security code when resetting their password
      Then they click the "Resend the email" button
      Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page

    Scenario: The user resets their password
      When they click on the forgot password link in their email
      When they submit a valid password
      And they submit a correct security code
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "Your services"
      When they click Your account link in the left side navigation
      Then they should be redirected to the "/account" page
      And they should see the text "Last updated just now"
