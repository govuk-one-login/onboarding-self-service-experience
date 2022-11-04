Feature:
  Users can sign up to the self-service experience

  Scenario: The user tries to sign in with account which is not registered
    Given that the user is on the "/" page
    When the user enters "not-registered@gds.gov.uk" email
    Then they should be directed to the following page: "/no-account"