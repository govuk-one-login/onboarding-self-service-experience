Feature: Change your service name

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    When they click on the "Change service name" link
    Then they should be redirected to a page with the title "Change service name - GOV.UK One Login"

  Scenario: User verifying the accessibility of change your service page
    Then there should be no accessibility violations
