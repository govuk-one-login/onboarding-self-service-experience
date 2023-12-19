Feature: Users can sign up to the self-service experience using real data.

  Background:
    Given the user is on the "/register" page

  Rule: Register Account
    Scenario: The user registers a new account
      When they submit the email "david.stump@digital.cabinet-office.gov.uk"
      Then they should be redirected to the "/register/enter-email-code" page
      Then wait for email "Your security code for the GOV.UK One Login admin tool"
      Then extract the security code from email
      Then register the code with Cognito
      Then pause for registration to complete
      Then they should be redirected to the "/register/enter-password" page
