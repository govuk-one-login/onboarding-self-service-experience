Feature: Users can sign in to the self-service experience

  Background:
    Given the user is on the "/sign-in" page

  Rule: The user validating the accessibility issues in Sign-In Journey pages

    Scenario: User verifying the accessibility of SigIn page
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /sign-in/enter-password page
      When they submit the email "registered@test.gov.uk"
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /sign-in/forgot-password page
      When they submit the email "registered@test.gov.uk"
      And they click on the "Forgot your password?" link
      Then there should be no accessibility violations

    Scenario: user verifying the accessibility of /forgot-password/enter-email-code page
      When they submit the email "registered@test.gov.uk"
      And they click on the "Forgot your password?" link
      And they click the Continue button
      Then there should be no accessibility violations

    Scenario: user verifying the accessibility of /sign-in/enter-text-code page
      When they submit the email "registered@test.gov.uk"
      And they submit a valid password
      Then there should be no accessibility violations

    Scenario: user verifying the accessibility of /sign-in/resend-text-code page
      When they submit the email "registered@test.gov.uk"
      And they submit a valid password
      And they click on the 'Problems receiving a text message?' link
      Then there should be no accessibility violations

    Scenario: user verifying the accessibility of /services page
      When they submit the email "registered@test.gov.uk"
      And they submit a valid password
      And they submit a correct security code
      Then there should be no accessibility violations
