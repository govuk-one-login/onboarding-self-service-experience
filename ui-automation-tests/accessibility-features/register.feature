Feature: Users can sign up to the self-service experience

  Background:
    Given the user is on the "/register" page

  Rule: The user validating the accessibility issues in registration pages
    Scenario: user verifying /register/enter-email-address page
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /enter-email-code page
      Given they submit the email "registering-successfully@test.gov.uk"
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /register/resend-email-code
      Given they submit the email "registering-successfully@test.gov.uk"
      When they click on the "Not received an email?" link
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /create-password page
      Given they submit the email "registering-successfully@test.gov.uk"
      When they submit a correct security code
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /enter-phone-number page
      Given they submit the email "registering-successfully@test.gov.uk"
      When they submit a correct security code
      And they submit a valid password
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /register/resend-text-code
      Given they submit the email "registering-successfully@test.gov.uk"
      When they submit a correct security code
      And they submit a valid password
      And they submit a valid mobile phone number "07700 900100"
      And they click on the "Problems receiving a text message?" link
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of to /enter-text-code page
      Given they submit the email "registering-successfully@test.gov.uk"
      When they submit a correct security code
      And they submit a valid password
      And they submit a valid mobile phone number "07700 900100"
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /create-service page
      Given they submit the email "registering-successfully@test.gov.uk"
      When they submit a correct security code
      And they submit a valid password
      And they submit a valid mobile phone number "07700 900100"
      And they submit a correct security code
      Then there should be no accessibility violations
