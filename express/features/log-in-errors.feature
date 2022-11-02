Feature:
  User tries to log in but enters incorrect password

  Scenario: The user tries to log in and submits registered email but enters no value into the password field

    Given that the user is on the "/sign-in" page
    When they enter "password-will-be-wrong@stub.gov.uk" into the text-field with the id "email"
    When they click the Submit button
    Then they should see the text "Enter your password"
    When the user enters the password "" into the password field and submits it
    Then the error message "Enter your password" must be displayed for the "password" field

  Scenario: The user tries to log in and submits registered email but enters wrong password

    Given that the user is on the "/sign-in" page
    When they enter "password-will-be-wrong@stub.gov.uk" into the text-field with the id "email"
    When they click the Submit button
    Then they should see the text "Enter your password"
    When the user enters the password "WrongPa$$word" into the password field and submits it
    Then the error message "Incorrect password" must be displayed for the "password" field

  Scenario: The user tries to register but enters an email that is already registered and being redirected to An account already exists does not enter any password

    Given that the user is on the "/create/get-email" page
    When they enter "inuse-password-will-be-wrong@foo.gov.uk" into the text-field with the id "emailAddress"
    When they click the Submit button
    Then they should see the text "An account already exists"
    When the user enters the password "" into the password field and submits it
    Then they should see the text "An account already exists"
    Then the error message "Enter your password" must be displayed for the "password" field

  Scenario: The user tries to register but enters an email that is already registered and being redirected to An account already exists enters wrong password

    Given that the user is on the "/create/get-email" page
    When they enter "inuse-password-will-be-wrong@foo.gov.uk" into the text-field with the id "emailAddress"
    When they click the Submit button
    Then they should see the text "An account already exists"
    When the user enters the password "WrongPa$$word" into the password field and submits it
    Then they should see the text "An account already exists"
    Then the error message "Incorrect password" must be displayed for the "password" field
