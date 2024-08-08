Feature: A page where users can view and change the details associated with their account

  Background:
    Given the user is signed in
    When they click Your account link in the left side navigation
    Then they should be redirected to the "/account" page
    And they should see the text "Your account"

  Rule: The user tries to change their phone number
    Background:
      When they click on the link that points to "/account/change-phone-number"
      Then they should see the text "Change your mobile phone number"

    @ci
    Scenario Outline: The user enters an invalid phone number
      When they submit the mobile phone number "<mobileNo>"
      Then the error message "<errorMsg>" must be displayed for the mobile phone number field

      @smoke
      Examples:
        | mobileNo      | errorMsg                                          |
        | +919465245634 | Enter a UK mobile phone number, like 07700 900000 |

      Examples:
        | mobileNo      | errorMsg                                          |
        |               | Enter a mobile phone number                       |
        | 075ABC54$78   | Enter a UK mobile phone number using numbers only |

    @ci
    Scenario: User cancels the phone number update
      When they click on the 'Cancel' link
      Then they should be redirected to the '/account' page

  Rule: The user tries to enter security code in the process of changing their phone number
    Background:
      When they click on the link that points to "/account/change-phone-number"
      Then they should see the text "Change your mobile phone number"
      And they submit a valid mobile phone number "07700 900123"

    @ci @smoke
    Scenario: The user enters an incorrect SMS code
      When they submit an incorrect security code "666666"
      Then they should be redirected to the "/account/change-phone-number/enter-text-code" page
      And they should see the text "The code you entered is not correct or has expired - enter it again or request a new code"

    # TODO this test doesn't check the resending of the phone code
    @ci
    Scenario: The user needs a new SMS code
      When they submit an incorrect security code "666666"
      Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the security code field
      And they should see the text "We sent a code to: 07700 900123"
      When they click on the "Problems receiving a text message?" link
      Then they should be redirected to the "/account/change-phone-number/resend-text-code" page
      And they should see the text "Resend security code"

    @ci @smoke
    Scenario: The user successfully changes their phone number
      When they submit a correct security code
      Then they should be redirected to the "/account" page
      And they should see the text "You have changed your mobile phone number"
      And they should see the text "07700 900123"

  Rule: The user tries to change their password
    Background:
      When they click on the link that points to "/account/change-password"
      Then they should be redirected to the "/account/change-password" page
      And they should see the text "Add your new password"

    @ci @smoke
    Scenario: User enters less than 8 characters for their new password
      When they enter the current password correctly
      And they submit the new password "NewTest"
      And they should see the text "Add your new password"
      Then the error message "Your password must be 8 characters or more" must be displayed for the new password field

    @ci
    Scenario: User cancels the password change
      When they click on the 'Cancel' link
      Then they should be redirected to the '/account' page

    @ci
    Scenario Outline: The user wants to see or hide their <password_type> as they type it
      When they toggle the "Show" link on the field "<password_field>"
      Then they see the toggle link "Hide" on the field "<password_field>"
      And they can see the content in the <password_type> field
      When they toggle the "Hide" link on the field "<password_field>"
      Then they see the toggle link "Show" on the field "<password_field>"
      And they can not see the content in the <password_type> field
      Examples:
        | password_type    | password_field  |
        | current password | currentPassword |
        | new password     | newPassword     |

    @ci @smoke
    Scenario: The user tries to change their current password and does not enter any value into any of the two fields
      When they click the Confirm button
      Then the error message "Enter your current password" must be displayed for the current password field
      And the error message "Enter your new password" must be displayed for the new password field

    @ci
    Scenario: The user tries to change their current password and does not enter any value for the new password
      When they enter the current password correctly
      And they click the Confirm button
      Then the error message "Enter your new password" must be displayed for the new password field

    @ci
    Scenario: The user tries to change their current password and does not enter any value for the current password
      When they submit the new password "NewTestPa$$word"
      Then the error message "Enter your current password" must be displayed for the current password field

    Scenario: User successfully changes their password
      When they change their password
      Then they should be redirected to the "/account" page
      And they should see the text "You have changed your password"
