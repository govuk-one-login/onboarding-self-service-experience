Feature: Users can sign up to the self-service experience using real data.

  Background:
    Given the user is on the "/register" page

  Rule: Register Account
    Scenario: The user registers a new account
      When they submit the email "~Registered"
      Then pause whilst waiting to complete
      Then they should be redirected to the "/register/enter-email-code" page
      Then they submit the security code "~Registered"
      Then pause whilst waiting to complete
      Then they should be redirected to the "/register/create-password" page
      Then they submit the password "~Registered"
      Then pause whilst waiting to complete
      Then they should be redirected to the "/register/enter-phone-number" page
      Then they submit the mobile phone number "~Registered"
      Then pause whilst waiting to complete
      Then they should be redirected to the "/register/enter-text-code" page
      Then they submit the security code "~Registered"
      Then pause whilst waiting to complete
      Then they should be redirected to the "/register/create-service" page
      Then they submit the service name "Test Service 1"
      Then pause whilst waiting to complete
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
