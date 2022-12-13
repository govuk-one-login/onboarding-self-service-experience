Feature: Happy paths for the self-service sign-in flow

  Background:
    Given that the user is on the "/sign-in" page

  Scenario: The user’s email address is accepted for sign-in
    When they enter "registered@gds.gov.uk" into the "emailAddress" field
    When they click the Continue button
    Then they should be redirected to the "/sign-in-password" page

  Scenario: User enters a valid password
    When they enter "registered@gds.gov.uk" into the "emailAddress" field
    When they click the Submit button
    Then they should see the text "Enter your password"
    When they enter "ValidPassword" into the "password" field
    When they click the Submit button
    Then they should be redirected to the "/sign-in-otp-mobile" page

  Scenario: The user wants to see their password as they type it
    When they enter "registered@gds.gov.uk" into the "emailAddress" field
    When they click the Submit button
    Then they should see the text "Enter your password"
    When they toggle the "Show" link
    When they enter "PasswordIsShown" into the "password" field
    Then they see the toggle "Hide" link
