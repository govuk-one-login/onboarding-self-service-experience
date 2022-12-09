Feature: Users can sign up to the self-service experience

  Background:
    Given that the user is on the "/create/get-email" page

  Rule: The user tries to submit an email address when creating an account

    Scenario: The user submits an empty email address
      When they enter "" into the "emailAddress" field
      When they click the Submit button
      Then the error message "Enter your email address" must be displayed for the "emailAddress" field

    Scenario: The user enters an email address that is not on the allowed list
      When the user submits the email "registering-successfully@yahoo.com"
      Then the error message "Enter a government email address" must be displayed for the "emailAddress" field

    Scenario: The user enters an email address in an incorrect format
      When the user submits the email "registering-successfullyyahoo.com"
      Then the error message "Enter an email address in the correct format, like name@example.com" must be displayed for the "emailAddress" field

  Rule: The user tries to verify email security code when creating an account
    Background:
      Given the user submits the email "registering-successfully@gds.gov.uk"
      Then they should be redirected to the "/create/check-email" page

    Scenario: The user submits an empty security code
      When they click the Submit button
      Then the error message "Enter the 6 digit security code" must be displayed for the "securityCode" field
      And they should see the text "We have sent an email to: registering-successfully@gds.gov.uk"

    Scenario: The user enters a security code in an incorrect format
      When the user submits the security code "AA1234"
      Then the error message "Your security code should only include numbers" must be displayed for the "securityCode" field
      And they should see the text "We have sent an email to: registering-successfully@gds.gov.uk"

  Rule: The user tries to sign up with an email that is already registered

    Scenario: The user signs in instead
      When the user submits the email "inuse@foo.gov.uk"
      Then they should be redirected to the "/existing-account" page
      And they should see the text "An account already exists with the email address inuse@foo.gov.uk"

      When the user submits the password "this-is-not-a-common-password"
      And the user submits the security code "123456"
      Then they should be redirected to a page with path starting with "/client-details"
      And they should see the text "Your services"

    Scenario: The user tries to sign in and enters an empty password
      When the user submits the email "inuse@foo.gov.uk"
      Then they should be redirected to the "/existing-account" page
      Then they should see the text "An account already exists with the email address inuse@foo.gov.uk"
      When the user submits the password ""
      Then the error message "Enter your password" must be displayed for the "password" field

    Scenario: The user tries to sign in and enters the wrong password
      When the user submits the email "inuse-password-will-be-wrong@foo.gov.uk"
      Then they should be redirected to the "/existing-account" page
      Then they should see the text "An account already exists with the email address inuse-password-will-be-wrong@foo.gov.uk"
      When the user submits the password "WrongPa$$word"
      Then the error message "Incorrect password" must be displayed for the "password" field

  Rule: The user tries to set a password when creating an account
    Background:
      Given the user submits the email "registering-successfully@gds.gov.uk"
      And the user submits a correct security code
      Then they should be redirected to the "/create/update-password" page

    Scenario: The user tries to use a password on the list of common passwords
      When the user submits the password "Password123"
      Then they should be redirected to the "/create/update-password" page
      And they should see the text "Enter a stronger password. Do not use very common passwords like ‘password’ or a sequence of numbers."

    Scenario: The user submits an empty password
      When the user submits the password ""
      Then they should be redirected to the "/create/update-password" page
      And the error message "Enter a password" must be displayed for the "password" field

    Scenario: The user enters a password that is fewer than 8 characters
      When the user submits the password "Pa$1GOv"
      Then they should be redirected to the "/create/update-password" page
      And the error message "Your password must be 8 characters or more" must be displayed for the "password" field

  Rule: The user tries to add a phone number when creating an account
    Background:
      Given the user submits the email "registering-successfully@gds.gov.uk"
      And the user submits a correct security code
      And the user submits a valid password
      Then they should be redirected to the "/create/enter-mobile" page

    Scenario: The user submits an empty phone number
      When the user submits the mobile phone number ""
      Then the error message "Enter a mobile phone number" must be displayed for the "mobileNumber" field

    Scenario: The user submits a phone number with non-numeric characters
      When the user submits the mobile phone number "075ABC54378"
      Then the error message "Enter a UK mobile phone number using numbers only" must be displayed for the "mobileNumber" field

    Scenario: The user submits a non-UK mobile number
      When the user submits the mobile phone number "+17564319555"
      Then the error message "Enter a UK mobile phone number, like 07700 900000" must be displayed for the "mobileNumber" field

  Rule: The user tries to verify the SMS security code when creating an account
    Background:
      Given the user submits the email "registering-successfully@gds.gov.uk"
      And the user submits a correct security code
      And the user submits a valid password
      And the user submits a valid mobile phone number
      Then they should be redirected to the "/create/enter-mobile" page
      And they should see the text "We sent a code to: 07700 900123"

    Scenario: The user submits an empty code
      When the user submits the security code ""
      Then they should be redirected to the "/create/verify-phone-code" page
      And the error message "Enter the 6 digit security code" must be displayed for the "securityCode" field
      And they should see the text "We sent a code to: 07700 900123"

    Scenario: The user submits a code with more than 6 digits
      When the user submits the security code "1234567"
      Then they should be redirected to the "/create/verify-phone-code" page
      And the error message "Enter the security code using only 6 digits" must be displayed for the "securityCode" field
      And they should see the text "We sent a code to: 07700 900123"

    Scenario: The user submits a code with fewer than 6 digits
      When the user submits the security code "12345"
      Then they should be redirected to the "/create/verify-phone-code" page
      And the error message "Enter the security code using only 6 digits" must be displayed for the "securityCode" field
      And they should see the text "We sent a code to: 07700 900123"

    Scenario: The user submits a code with letters
      When the user submits the security code "12345A"
      Then they should be redirected to the "/create/verify-phone-code" page
      And the error message "Your security code should only include numbers" must be displayed for the "securityCode" field
      And they should see the text "We sent a code to: 07700 900123"

    Scenario: The user submits a code with special characters
      When the user submits the security code "12345$"
      Then they should be redirected to the "/create/verify-phone-code" page
      And the error message "Your security code should only include numbers" must be displayed for the "securityCode" field
      And they should see the text "We sent a code to: 07700 900123"

    Scenario: The user submits an incorrect code
      When the user submits the security code "666666"
      Then they should be redirected to the "/create/verify-phone-code" page
      And the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the "securityCode" field
      And they should see the text "We sent a code to: 07700 900123"

  Rule: The user tries to add a service when creating an account
    Background:
      Given the user submits the email "registering-successfully@gds.gov.uk"
      And the user submits a correct security code
      And the user submits a valid password
      And the user submits a valid mobile phone number
      And the user submits a correct security code
      Then they should be redirected to the "/add-service-name" page

    Scenario: The user types everything correctly, creates an account and adds a service
      When the user submits a correct service name
      Then they should be redirected to the "/client-details/vice-id" page

    Scenario: The user submits an empty service name
      When the user submits the service name ""
      Then they should be redirected to the "/create-service-name-validation" page
      And the error message "Enter your service name" must be displayed for the "serviceName" field
