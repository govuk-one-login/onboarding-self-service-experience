Feature: Joining public beta

  Background:
    Given the user is signed in
    And they goto on the test service page
    When they click on the "Register to join public beta" link
    Then they should be redirected to a page with the title "Register to join public beta - GOV.UK One Login"

  Rule: The user validate accessibility issues in /public-beta page
    Scenario: User verifying the accessibility of /change-post-logout-uris page
      When they click on the "Register to join public beta" link
      Then there should be no accessibility violations
