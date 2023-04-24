Feature: Unhappy paths for the self-service sign-in flow

  Background:
    Given the user is on the "/sign-in" page

  Scenario: User does not enter a valid email address
    When the user submits the email "invalid-email.com"
    Then the error message "Enter an email address in the correct format, like name@example.com" must be displayed for the "emailAddress" field

  Scenario: The user does not enter any characters into the free text field
    When the user submits the email ""
    Then the error message "Enter your email address" must be displayed for the "emailAddress" field

  Scenario: User doesn't enter any characters into the password field
    When they enter "registered@gds.gov.uk" into the "emailAddress" field
    When they click the Continue button
    Then they should be redirected to the "/sign-in/enter-password" page
    When they enter "" into the "password" field
    When they click the Continue button
    Then the error message "Enter your password" must be displayed for the "password" field

  Scenario: User enters an invalid password
    When they enter "password-will-be-wrong@stub.gov.uk" into the "emailAddress" field
    When they click the Submit button
    Then they should see the text "Enter your password"
    When they enter "Invalid-Password" into the "password" field
    When they click the Submit button
    Then the error message "Incorrect password" must be displayed for the "password" field

  Scenario: The user tries to sign in with account which is not registered
    When they enter "not-registered@gds.gov.uk" into the "emailAddress" field
    When they click the Submit button
    When they enter "notEmptyPassword" into the "password" field
    When they click the Submit button
    Then they should be redirected to the "/sign-in/account-not-found" page

  Scenario: The user tries to reset their password during sign-in
    When they enter "registered@gds.gov.uk" into the "emailAddress" field
    When they click the Submit button
    Then they click on the "Forgot your password?" link
    Then they should be redirected to the "/sign-in/forgot-password" page
    Then they click the Continue button
    Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page
    When they click on the forgot password link in their email
    When the user submits the password "this-is-not-a-common-password"
    And the user submits the security code "123456"
    Then they should be redirected to a page with the path starting with "/services"
    And they should see the text "Your services"
    When they click on the "Your account" link
    Then they should be redirected to the "/account" page
    And they should see the text "Last updated just now"

  Scenario: The user tries to use a password on the list of common passwords during password reset
    When they enter "registered@gds.gov.uk" into the "emailAddress" field
    When they click the Submit button
    Then they click on the "Forgot your password?" link
    Then they should be redirected to the "/sign-in/forgot-password" page
    Then they click the Continue button
    Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page
    When they click on the forgot password link in their email
    When the user submits the password "Password123"
    And they should see the text "Enter a stronger password. Do not use very common passwords like ‘password’ or a sequence of numbers."

  Scenario: The user resends the email security code when resetting their password
    When they enter "registered@gds.gov.uk" into the "emailAddress" field
    When they click the Submit button
    Then they click on the "Forgot your password?" link
    Then they should be redirected to the "/sign-in/forgot-password" page
    Then they click the Continue button
    Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page
    Then they click the "Resend the email" button
    Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page

  Scenario: The user tries to log in and submits registered email but enters no value into the password field
    When they enter "password-will-be-wrong@stub.gov.uk" into the "emailAddress" field
    When they click the Submit button
    Then they should see the text "Enter your password"
    When they enter "" into the "password" field
    When they click the Submit button
    Then the error message "Enter your password" must be displayed for the "password" field

  Scenario: The user tries to log in and submits registered email but enters wrong password
    When they enter "password-will-be-wrong@stub.gov.uk" into the "emailAddress" field
    When they click the Submit button
    Then they should see the text "Enter your password"
    When they enter "WrongPa$$word" into the "password" field
    When they click the Submit button
    Then the error message "Incorrect password" must be displayed for the "password" field
