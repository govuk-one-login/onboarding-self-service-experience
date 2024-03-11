Feature: Joining public beta

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    When they click on the "Register to join public beta" link
    Then they should be redirected to a page with the title "Register to join public beta - GOV.UK One Login"

  Rule: The user validate accessibility issues in /public-beta page
    Scenario: User verifying the accessibility of /change-post-logout-uris page
      When they click on the "Register to join public beta" link
      Then there should be no accessibility violations
