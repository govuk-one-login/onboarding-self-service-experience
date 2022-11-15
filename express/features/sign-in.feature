Feature:
  Users can sign up to the self-service experience

  Scenario: The user tries to sign in with account which is not registered
    Given that the user is on the "/" page
    When the user enters "not-registered@gds.gov.uk" email
    Then they should be directed to the following page: "/no-account"

  Scenario: The user tries reset password clicking forgot password during sign-in
    Given that the user is on the "/" page
    When the user enters "registered@gds.gov.uk" email and click continue
    Then they click on the "Forgot your password?" link
    Then they should be directed to the following page: "/forgot-password"
    Then they click on the "Continue" button-link
    Then they should be directed to the following page: "/check-email-password-reset"