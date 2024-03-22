Feature: Users can sign up to the self-service experience using real data.

  Background:
    Given the user is on the "/register" page

  Rule: Register Account
    Scenario: The user registers a new account
      When they submit the email "testuser1@digital.cabinet-office.gov.uk"
      Then they should be redirected to the "/register/enter-email-code" page
      Then they submit the security code "123456"
      Then they should be redirected to the "/register/create-password" page
      Then they submit the password "TestUserPassword"
      Then they should be redirected to the "/register/enter-phone-number" page
      Then they submit the mobile phone number "07700 900000"
      Then they should be redirected to the "/register/enter-text-code" page
      Then they submit the security code "789012"
      Then they should be redirected to the "/register/create-service" page
      Then they submit the service name "Test Service 1"
      Then pause whilst waiting to complete
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
