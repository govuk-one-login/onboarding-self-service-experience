Feature:
  A page where users can view and change the details associated with their account.

  Background:
    Given the user has logged in and arrived on the your account page
    When they click on the link that points to "/change-phone-number"
    Then they should see the text "Change your mobile phone number"

    When they enter "0770 9000 124" into the text-field with the id "mobileNumber"
    And they click the Continue button
    Then they should see the text "We sent a code to: 0770 9000 124"

  Scenario: The user successfully changes their phone number

    When they enter "123456" into the text-field with the id "sms-otp"
    And they click the Continue button
    Then they should see the text "You have changed your mobile phone number"
    And they should see the text "0770 9000 124"

  Scenario: The user tries to change their phone number but enters an incorrect SMS code

    When they enter "666666" into the text-field with the id "sms-otp"
    And they click the Continue button
    Then they should see the text "The code you entered is not correct or has expired - enter it again or request a new code"

  Scenario: The user tries to change their phone number but needs a new SMS code

    Given the user has logged in and arrived on the your account page
    When they click on the link that points to "/change-phone-number"
    Then they should be directed to the following page: "/change-phone-number"

    Given that the user is on the "/change-phone-number" page
    When the user submits the mobile phone number "07700901123"
    Then they should see the text "Check your mobile phone"

    When the user submits the sms otp code "666666"
    Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the "sms-otp" field
    And they should see the text "We sent a code to: 07700901123"

    When they click on the link that points to "/create/resend-phone-code"
    Then they should see the text "Resend security code"

  Scenario: The user tries to change their current password

    Given the user has logged in and arrived on the your account page
    When they click on the link that points to "/change-password"
    Then they should see the text "Add your new password"

    When they enter "OldTestPa$$word" into the text-field with the id "currentPassword"
    When they enter "NewTestPa$$word" into the text-field with the id "password"
    When they click the Submit button
    Then they should be directed to the following page: "/account"
    And they should see the text "You have changed your password"

  Scenario: The user tries to change their current password and does not enter any value into any of the two fields

    Given the user has logged in and arrived on the your account page
    When they click on the link that points to "/change-password"
    Then they should see the text "Add your new password"

    When they click the Submit button
    Then the error message "Enter your current password" must be displayed for the "currentPassword" field

  Scenario: The user tries to change their current password and does not enter any value into Enter a new password field

    Given the user has logged in and arrived on the your account page
    When they click on the link that points to "/change-password"
    Then they should see the text "Add your new password"
    When they enter "OldTestPa$$word" into the text-field with the id "currentPassword"
    When they click the Submit button

    Then the error message "Enter your new password" must be displayed for the "password" field

  Scenario: The user tries to change their current password and does not enter any value into Current password field

    Given the user has logged in and arrived on the your account page
    When they click on the link that points to "/change-password"
    Then they should see the text "Add your new password"
    When they enter "NewTestPa$$word" into the text-field with the id "password"
    When they click the Submit button

    Then the error message "Enter your current password" must be displayed for the "currentPassword" field
