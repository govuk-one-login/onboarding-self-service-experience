Feature:
  Users can sign up to the self-service experience

  Scenario: A user types everything correctly and creates an account

    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"

    When the user submits the correct email-otp
    Then they should be directed to the following page: "/create/update-password"

    When the user submits a valid password
    Then they should be directed to the following page: "/create/enter-mobile"

    When the user submits a valid mobile telephone number
    Then they should be directed to the following page: "/create/enter-mobile"

    When the user enters the correct sms-otp
    Then they should be directed to the following page: "/add-service-name"

  Scenario: A user tries to use a password on the list of common passwords

    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"

    When the user submits the correct email-otp
    Then they should be directed to the following page: "/create/update-password"

    When the user submits a common password
    Then they should be directed to the following page: "/create/update-password"
    And they should see the text "Enter a stronger password. Do not use very common passwords like ‘password’ or a sequence of numbers."
