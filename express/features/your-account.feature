Feature: A page where users can view and change the details associated with their account

  Background:
    Given that the user is on the "/sign-in/enter-email-address" page
    And the user submits the email "registered@gds.gov.uk"
    And the user submits the password "this-is-not-a-common-password"
    And the user submits the security code "123123"
    Then they should be redirected to a page with the path starting with "/services"

    When they click on the "Your account" link
    Then they should be redirected to the "/account" page
    And they should see the text "Your account"

  Rule: The user tries to change their phone number
    Background:
      When they click on the link that points to "/change-phone-number"
      Then they should see the text "Change your mobile phone number"
      Then the user submits the mobile phone number "0770 9000 124"

    Scenario: The user does not enter any characters when changing the phone number
      Given that the user is on the "/change-phone-number" page
      Then they should see the text "Change your mobile phone number"
      Then the user submits the mobile phone number ""
      Then the error message "Enter a mobile phone number" must be displayed for the "mobileNumber" field

    Scenario: User enters an international phone number when changing phone number
      Given that the user is on the "/change-phone-number" page
      Then they should see the text "Change your mobile phone number"
      Then the user submits the mobile phone number "+919465245634"
      Then the error message "Enter a UK mobile phone number, like 07700 900000" must be displayed for the "mobileNumber" field

    Scenario: User enters invalid characters when changing phone number
      Given that the user is on the "/change-phone-number" page
      Then they should see the text "Change your mobile phone number"
      Then the user submits the mobile phone number "077$$ 900000"
      Then the error message "Enter a UK mobile phone number using numbers only" must be displayed for the "mobileNumber" field

    Scenario: User enters an invalid number when changing phone number
      Given that the user is on the "/change-phone-number" page
      Then they should see the text "Change your mobile phone number"
      Then the user submits the mobile phone number "08723900"
      Then the error message "Enter a UK mobile phone number, like 07700 900000" must be displayed for the "mobileNumber" field

    Scenario: The user successfully changes their phone number
      When the user submits the security code "123456"
      Then they should be redirected to the "/account" page
      And they should see the text "You have changed your mobile phone number"
      And they should see the text "0770 9000 124"

    Scenario: The user tries to change their phone number but enters an incorrect SMS code
      When the user submits the security code "666666"
      Then they should be redirected to the "/account/change-phone-number/enter-text-code" page
      And they should see the text "The code you entered is not correct or has expired - enter it again or request a new code"

    # TODO this test doesn't check the resending of the phone code
    Scenario: The user tries to change their phone number but needs a new SMS code
      When the user submits the security code "666666"
      Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the "securityCode" field
      And they should see the text "We sent a code to: 0770 9000 124"

      When they click on the "Problems receiving a text message?" link
      Then they should be redirected to the "/account/change-phone-number/resend-text-code" page
      And they should see the text "Resend security code"

  Rule: The user tries to change their password
    Background:
      When they click on the link that points to "/change-password"
      Then they should be redirected to the "/change-password" page
      And they should see the text "Add your new password"

    Scenario: User enters less than 8 characters for their new password
      When they enter "TestPa$$word" into the "currentPassword" field
      When they enter "NewTest" into the "newPassword" field
      When they click the Confirm button
      Then the error message "Your password must be 8 characters or more" must be displayed for the "newPassword" field

    Scenario: User selects the Show toggle for the current password field
      When they toggle the "Show" link on the field "currentPassword"
      Then they see the toggle link "Hide" on the field "currentPassword"

    Scenario: User selects Show for the new password field
      When they toggle the "Show" link on the field "newPassword"
      Then they see the toggle link "Hide" on the field "newPassword"

    Scenario: User successfully changes their password
      When they enter "OldTestPa$$word" into the "currentPassword" field
      When they enter "NewTestPa$$word" into the "newPassword" field
      When they click the Confirm button
      Then they should be redirected to the "/account" page
      And they should see the text "You have changed your password"

    Scenario: The user tries to change their current password and does not enter any value into any of the two fields
      When they click the Confirm button
      Then the error message "Enter your current password" must be displayed for the "currentPassword" field

    Scenario: The user tries to change their current password and does not enter any value into Enter a new password field
      When they enter "OldTestPa$$word" into the "currentPassword" field
      When they click the Confirm button
      Then the error message "Enter your new password" must be displayed for the "newPassword" field

    Scenario: The user tries to change their current password and does not enter any value into Current password field
      When they enter "NewTestPa$$word" into the "newPassword" field
      When they click the Confirm button
      Then the error message "Enter your current password" must be displayed for the "currentPassword" field
