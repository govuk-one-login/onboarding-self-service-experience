Feature: Change your service name

  Background:
    Given the user is signed inthey click on the test service link
    When they click on the "Change service name" link
    Then they should be redirected to a page with the title "Change service name - GOV.UK One Login"

  Scenario: User verifying the accessibility of change your service page
    Then there should be no accessibility violations
