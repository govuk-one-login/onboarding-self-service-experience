Feature: Users can sign into the self-service experience using real data.

  Background:
    Given the user is on the "/sign-in" page

  Rule: Register Account
    Scenario: The user logs into an existing account
      When they submit the email "testuser1@digital.cabinet-office.gov.uk"
      Then they should be redirected to the "/sign-in/enter-password" page
      Then they submit the password "TestUserPassword"
      Then they should be redirected to the "/sign-in/enter-text-code" page
      Then they submit the security code "789012"
      Then pause whilst waiting to complete
      Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
