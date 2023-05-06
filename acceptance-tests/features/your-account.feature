Feature: A page where users can view and change the details associated with their account

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@gds.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"

    When they click "Your account" in side navigation
    Then they should be redirected to the "/account" page
    And they should see the text "Your account"

  Rule: The user tries to change their phone number
    Background:
      When they click on the link that points to "/account/change-phone-number"
      Then they should see the text "Change your mobile phone number"
      And they submit a valid mobile phone number

    Scenario: The user does not enter any characters when changing the phone number
      Given the user is on the "/account/change-phone-number" page
      Then they should see the text "Change your mobile phone number"
      When they submit the mobile phone number ""
      Then the error message "Enter a mobile phone number" should be displayed for the mobile phone number field

    Scenario: User enters an international phone number when changing phone number
      Given the user is on the "/account/change-phone-number" page
      Then they should see the text "Change your mobile phone number"
      When they submit the mobile phone number "+919465245634"
      Then the error message "Enter a UK mobile phone number, like 07700 900000" should be displayed for the mobile phone number field

    Scenario: User enters invalid characters when changing phone number
      Given the user is on the "/account/change-phone-number" page
      Then they should see the text "Change your mobile phone number"
      When they submit the mobile phone number "075ABC54$78"
      Then the error message "Enter a UK mobile phone number using numbers only" should be displayed for the mobile phone number field

    Scenario: User enters an invalid number when changing phone number
      Given the user is on the "/account/change-phone-number" page
      Then they should see the text "Change your mobile phone number"
      When they submit the mobile phone number "+919465245634"
      Then the error message "Enter a UK mobile phone number, like 07700 900000" should be displayed for the mobile phone number field

    Scenario: The user successfully changes their phone number
      When they submit a correct security code
      Then they should be redirected to the "/account" page
      And they should see the text "You have changed your mobile phone number"
      And they should see the text "07700 900123"

    Scenario: The user tries to change their phone number but enters an incorrect SMS code
      When they submit the security code "666666"
      Then they should be redirected to the "/account/change-phone-number/enter-text-code" page
      And they should see the text "The code you entered is not correct or has expired - enter it again or request a new code"

    # TODO this test doesn't check the resending of the phone code
    Scenario: The user tries to change their phone number but needs a new SMS code
      When they submit the security code "666666"
      Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" should be displayed for the security code field
      And they should see the text "We sent a code to: 07700 900123"

      When they click on the "Problems receiving a text message?" link
      Then they should be redirected to the "/account/change-phone-number/resend-text-code" page
      And they should see the text "Resend security code"

  Rule: The user tries to change their password
    Background:
      When they click on the link that points to "/account/change-password"
      Then they should be redirected to the "/account/change-password" page
      And they should see the text "Add your new password"

    Scenario: User enters less than 8 characters for their new password
      When they enter the current password "TestPa$$word"
      And they submit the new password "NewTest"
      Then the error message "Your password must be 8 characters or more" should be displayed for the new password field

    Scenario: The user wants to see their password as they type it
      When they enter the current password "CurrentPassword"
      Then the current password field should have the value "CurrentPassword"
      And the current password field value is hidden
      When they click the "Show" current password toggle
      And they enter "IsShown" into the current password field
      Then the current password field should have the value "CurrentPasswordIsShown"
      Then the current password field value is shown
      When they click the "Hide" current password toggle
      Then the current password field value is hidden

    Scenario: The user wants to see their new password as they type it
      When they enter the new password "NewPassword"
      Then the new password field should have the value "NewPassword"
      And the new password field value is hidden
      When they click the "Show" new password toggle
      And they enter "IsShown" into the new password field
      Then the new password field should have the value "NewPasswordIsShown"
      Then the new password field value is shown
      When they click the "Hide" new password toggle
      Then the new password field value is hidden

    Scenario: User successfully changes their password
      When they enter the current password "OldTestPa$$word"
      And they submit the new password "NewTestPa$$word"
      Then they should be redirected to the "/account" page
      And they should see the text "You have changed your password"

    Scenario: The user tries to change their password and does not enter a value into any of the two fields
      When they click the Confirm button
      Then the error message "Enter your current password" should be displayed for the current password field
      Then the error message "Enter your new password" should be displayed for the new password field

    Scenario: The user tries to change their current password and does not enter a value for the new password
      When they submit the current password "OldTestPa$$word"
      Then the error message "Enter your new password" should be displayed for the new password field

    Scenario: The user tries to change their current password and does not enter a value for the current password
      When they submit the new password "NewTestPa$$word"
      Then the error message "Enter your current password" should be displayed for the current password field
