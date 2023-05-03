Feature: Unhappy paths for the self-service sign-in flow

  Background:
    Given the user is on the "/sign-in" page

  Scenario: User does not enter a valid email address
    When they submit the email "invalid-email.com"
    Then the error message "Enter an email address in the correct format, like name@example.com" must be displayed for the email field

  Scenario: The user does not enter any characters into the free text field
    When they submit the email ""
    Then the error message "Enter your email address" must be displayed for the email field

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

  Scenario: The user tries to sign in with account which is not registered
    When they submit the email "not-registered@gds.gov.uk"
    When they submit a valid password
    Then they should be redirected to the "/sign-in/account-not-found" page

  Scenario: The user tries to reset their password during sign-in
    When they submit the email "registered@gds.gov.uk"
    Then they click on the "Forgot your password?" link
    Then they should be redirected to the "/sign-in/forgot-password" page
    Then they click the Continue button
    Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page
    When they click on the forgot password link in their email
    When they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the path starting with "/services"
    And they should see the text "Your services"
    When they click Your account link in the left side navigation
    Then they should be redirected to the "/account" page
    And they should see the text "Last updated just now"

  Scenario: The user tries to use a password on the list of common passwords during password reset
    When they submit the email "registered@gds.gov.uk"
    Then they click on the "Forgot your password?" link
    Then they should be redirected to the "/sign-in/forgot-password" page
    Then they click the Continue button
    Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page
    When they click on the forgot password link in their email
    When they submit the password "Password123"
    And they should see the text "Enter a stronger password. Do not use very common passwords like ‘password’ or a sequence of numbers."

  Scenario: The user resends the email security code when resetting their password
    When they submit the email "registered@gds.gov.uk"
    Then they click on the "Forgot your password?" link
    Then they should be redirected to the "/sign-in/forgot-password" page
    Then they click the Continue button
    Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page
    Then they click the "Resend the email" button
    Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page

  Scenario: The user tries to log in and submits registered email but enters no value into the password field
    When they submit the email "password-will-be-wrong@stub.gov.uk"
    Then they should see the text "Enter your password"
    When they submit the password ""
    Then the error message "Enter your password" must be displayed for the password field

  Scenario: The user tries to log in and submits registered email but enters wrong password
    When they submit the email "password-will-be-wrong@stub.gov.uk"
    Then they should see the text "Enter your password"
    When they submit the password "WrongPa$$word"
    Then the error message "Incorrect password" must be displayed for the password field
