Feature: Happy paths for the self-service sign-in flow

  Background:
    Given the user is on the "/sign-in" page

  Scenario: The user’s email address is accepted for sign-in
    When they submit the email "registered@gds.gov.uk"
    Then they should be redirected to the "/sign-in/enter-password" page

  Scenario: User enters a valid password
    When they submit the email "registered@gds.gov.uk"
    Then they should see the text "Enter your password"
    When they submit a valid password
    Then they should be redirected to the "/sign-in/enter-text-code" page

  Scenario: The user wants to see their password as they type it
    When they submit the email "registered@gds.gov.uk"
    Then they should see the text "Enter your password"
    When they toggle the "Show" link on the field "password"
    When they enter the password "PasswordIsShown"
    Then they see the toggle link "Hide" on the field "password"
