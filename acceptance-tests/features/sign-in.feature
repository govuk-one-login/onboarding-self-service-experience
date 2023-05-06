Feature: Happy paths for the self-service sign-in flow

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@gds.gov.uk"
    Then they should be redirected to the "/sign-in/enter-password" page
    And they should see the text "Enter your password"

  Scenario: The user wants to see their password as they type it
    When they enter the password "CurrentPassword"
    Then the password field should have the value "CurrentPassword"
    And the password field value is hidden
    When they click the "Show" password toggle
    And they enter "IsShown" into the password field
    Then the password field should have the value "CurrentPasswordIsShown"
    Then the password field value is shown
    When they click the "Hide" password toggle
    Then the password field value is hidden

  Scenario: The user enters a valid password
    When they submit a valid password
    Then they should be redirected to the "/sign-in/enter-text-code" page
