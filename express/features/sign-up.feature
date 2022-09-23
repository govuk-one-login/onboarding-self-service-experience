Feature:
  Users can sign up to the self-service experience

  Scenario: A user types everything correctly and creates an account

    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"
    And they should see the text "We have sent an email to: registering-successfully@gds.gov.uk"

    When the user submits the correct email-otp
    Then they should be directed to the following page: "/create/update-password"

    When the user submits a valid password
    Then they should be directed to the following page: "/create/enter-mobile"

    When the user submits a valid mobile telephone number
    Then they should be directed to the following page: "/create/enter-mobile"
    And they should see the text "We sent a code to: 07700 900123"

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

  Scenario: The user doesn't complete the Government email address

    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    Given that the user is on the "/create/get-email" page
    When they click the Submit button
    Then the error message "Enter your email address" must be displayed for the "emailAddress" field

  Scenario: The user enters an email address that is not on the passlist

    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@yahoo.com"
    Then the error message "Enter a government email address" must be displayed for the "emailAddress" field

  Scenario: The user enters an email address in an incorrect format

    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfullyyahoo.com"
    Then the error message "Enter an email address in the correct format, like name@example.com" must be displayed for the "emailAddress" field

  Scenario: The user doesn't complete the Check your email page

    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"


    Given that the user is on the "/create/check-email" page
    When they click the Submit button
    Then the error message "Enter the security code" must be displayed for the "create-email-otp" field
    And they should see the text "We have sent an email to: registering-successfully@gds.gov.uk"

  Scenario: The user enters anything other than 6 digits on the Check your email page

    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"

    Given that the user is on the "/create/check-email" page
    When the user submits the email-otp "AA1234"
    Then the error message "Enter the security code using only 6 digits" must be displayed for the "create-email-otp" field
    And they should see the text "We have sent an email to: registering-successfully@gds.gov.uk"

  Scenario: The user does not enter anything in the password field on Create your password page
    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"

    When the user submits the correct email-otp
    Then they should be directed to the following page: "/create/update-password"

    Given that the user is on the "/create/update-password" page
    When they click the Submit button
    Then the error message "Enter a password" must be displayed for the "password" field

  Scenario: The user enters a password that is fewer than 8 characters in the password field on Create your password page
    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"

    When the user submits the correct email-otp
    Then they should be directed to the following page: "/create/update-password"

    Given that the user is on the "/create/update-password" page
    When the user submits the password "Pa$1GOv"
    Then the error message "Your password must be 8 characters or more" must be displayed for the "password" field

  Scenario: The user enters common password in the password field on Create your password page
    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"

    When the user submits the correct email-otp
    Then they should be directed to the following page: "/create/update-password"

    Given that the user is on the "/create/update-password" page
    When the user submits the password "123456789"
    Then the error message "Enter a stronger password. Do not use very common passwords like ‘password’ or a sequence of numbers." must be displayed for the "password" field

  Scenario: The user does not enter anything in the UK mobile phone number field on Enter your mobile phone number page
    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"

    When the user submits the correct email-otp
    Then they should be directed to the following page: "/create/update-password"

    When the user submits a valid password
    Then they should be directed to the following page: "/create/enter-mobile"

    Given that the user is on the "/create/enter-mobile" page
    When they click the Submit button
    Then the error message "Enter a mobile phone number" must be displayed for the "mobileNumber" field

  Scenario: The user enters characters other than numbers or + - () in the UK mobile phone number field on Enter your mobile phone number page
    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"

    When the user submits the correct email-otp
    Then they should be directed to the following page: "/create/update-password"

    When the user submits a valid password
    Then they should be directed to the following page: "/create/enter-mobile"

    Given that the user is on the "/create/enter-mobile" page
    When the user submits the mobile phone number "075ABC"
    Then the error message "Enter a UK mobile phone number using numbers only" must be displayed for the "mobileNumber" field


  Scenario: The user an invalid number - which means a number that is international, less than 11 characters, or does not start with 07, 44, +44 or (+44)) in the UK mobile phone number field on Enter your mobile phone number page

    Given that the user is on the "/" page
    When they click on the "Create account" button-link
    Then they should be directed to the following page: "/create/get-email"

    When the user submits the email "registering-successfully@gds.gov.uk"
    Then they should be directed to the following page: "/create/check-email"

    When the user submits the correct email-otp
    Then they should be directed to the following page: "/create/update-password"

    When the user submits a valid password
    Then they should be directed to the following page: "/create/enter-mobile"

    Given that the user is on the "/create/enter-mobile" page
    When the user submits the mobile phone number "+17564319555"
    Then the error message "Enter a UK mobile phone number, like 07700 900000" must be displayed for the "mobileNumber" field

  Scenario: The user does not enter anything in the security code field on Check your mobile phone page
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
    And they should see the text "We sent a code to: 07700 900123"

    When they click the Submit button
    Then the error message "Enter the 6 digit security code" must be displayed for the "sms-otp" field
    And they should see the text "We sent a code to: 07700 900123"

  Scenario: The user enters more than 6 characters in the security code field on Check your mobile phone page
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
    And they should see the text "We sent a code to: 07700 900123"

    When the user submits the sms otp code "1234567"
    Then the error message "Enter the security code using only 6 digits" must be displayed for the "sms-otp" field
    And they should see the text "We sent a code to: 07700 900123"

  Scenario: The user enters fewer than than 6 characters in the security code field on Check your mobile phone page
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
    And they should see the text "We sent a code to: 07700 900123"

    When the user submits the sms otp code "12345"
    Then the error message "Enter the security code using only 6 digits" must be displayed for the "sms-otp" field
    And they should see the text "We sent a code to: 07700 900123"

  Scenario: The user enters any letters in the security code field on Check your mobile phone page
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
    And they should see the text "We sent a code to: 07700 900123"

    When the user submits the sms otp code "12345A"
    Then the error message "Your security code should only include numbers" must be displayed for the "sms-otp" field
    And they should see the text "We sent a code to: 07700 900123"

  Scenario: The user enters any special characters in the security code field on Check your mobile phone page
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
    And they should see the text "We sent a code to: 07700 900123"

    When the user submits the sms otp code "12345$"
    Then the error message "Your security code should only include numbers" must be displayed for the "sms-otp" field
    And they should see the text "We sent a code to: 07700 900123"

  Scenario: The user enters User enters the wrong code in the security code field on Check your mobile phone page
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
    And they should see the text "We sent a code to: 07700 900123"

    When the user submits the sms otp code "666666"
    Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the "sms-otp" field
    And they should see the text "We sent a code to: 07700 900123"

  Scenario: A user types everything correctly, creates an account and adds service name
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

    When the user enters the correct service name
    Then they should be directed to the following page: "/client-details/vice-id"

  Scenario: The user does not enter anything in the service name field on Add your service name page
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

    Given that the user is on the "/add-service-name" page
    When the user submits the service name ""
    Then the error message "Enter your service name" must be displayed for the "serviceName" field

