Feature: Users can sign in to the self-service experience

  Background:
    Given the user is on the "/sign-in" page

  Rule: The user tries to submit an email address
    @ci
    Scenario: The user does not enter any characters into the Email address text field
      When they submit the email ""
      Then the error message "Enter your email address" must be displayed for the email field

    @ci @smoke
    Scenario: User does not enter an invalid email address
      When they submit the email "invalid-email.com"
      Then the error message "Enter an email address in the correct format, like name@example.com" must be displayed for the email field

  Rule: The user is navigating back to previous page using back link
    Background:
      When they submit the current username correctly

    @ci
    Scenario: User navigates back to /enter-email-address page
      When they click on the "Back" link
      Then they should be redirected to the "/sign-in/enter-email-address" page

    @ci
    Scenario: User navigates back to /enter-password page
      When they click on the "Forgot your password?" link
      And they click on the "Back" link
      Then they should be redirected to the "/sign-in/enter-password" page

    @ci
    Scenario: User navigates back to /forgot-password page
      When they click on the "Forgot your password?" link
      And they click the Continue button
      And they click on the "Back" link
      Then they should be redirected to the "/sign-in/forgot-password" page

  Rule: The user tries to submit a password
    @ci
    Scenario Outline: User submits invalid passwords
      When they submit the current username correctly
      When they submit the password "<password>"
      Then the error message "<errorMessage>" must be displayed for the password field

      @smoke
      Examples:
        | password         | errorMessage        |
        | WrongPa$$word    | Incorrect password  |

      Examples:
        | password         | errorMessage        |
        |                  | Enter your password |
        | Invalid-Password | Incorrect password  |

  Rule: The user toggle the show/hide to view the password in signIn process
    @ci
    Scenario: The user wants to see or hide their password as they type it
      When they submit the current username correctly
      Then they should see the text "Enter your password"
      When they toggle the "Show" link on the field "password"
      And they enter the password "PasswordIsShown"
      Then they see the toggle link "Hide" on the field "password"
      And they can see the content in the password field
      When they toggle the "Hide" link on the field "password"
      And they see the toggle link "Show" on the field "password"
      Then they can not see the content in the password field

  Rule: The user tries to submit SMS security code
    Background:
      When they submit the current username correctly
      And they submit their password
      Then they should be redirected to the "/sign-in/enter-text-code" page

    @ci
    Scenario Outline: User submits a security code with invalid format
      When they submit the value of security code "<code>" that <condition>
      Then they should be redirected to the "/sign-in/enter-text-code" page
      And the error message "<error_message>" must be displayed for the security code field
      And they should see the text "We sent a code to:"

      @smoke
      Examples:
        | condition                   | code    | error_message                                                                             |
        | contains letters            | 12345A  | Your security code should only include numbers                                            |

      Examples:
        | condition                   | code    | error_message                                                                             |
        | is empty                    |         | Enter the 6 digit security code                                                           |
        | has more than 6 digits      | 1234567 | Enter the security code using only 6 digits                                               |
        | has fewer than 6 digits     | 12345   | Enter the security code using only 6 digits                                               |
        | contains special characters | 12345$  | Your security code should only include numbers                                            |
        | is incorrect or expired     | 000000  | The code you entered is not correct or has expired - enter it again or request a new code |

  Rule: The user tries to sign in with account which is not registered
    @ci @smoke
    Scenario: The user submits email and password but account is not registered
      When they submit the email "not-registered@test.gov.uk"
      And they submit a new valid password
      Then they should be redirected to the "/sign-in/account-not-found" page

  Rule: The user tries to reset their password
    Background:
      When they submit the current username correctly
      Then they click on the "Forgot your password?" link
      And they should be redirected to the "/sign-in/forgot-password" page
      When they click the Continue button
      Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page

    @ci @smoke
    Scenario: The user tries to use a password on the list of common passwords during password reset
      When they click on the forgot password link in their email
      And they submit the password "Password123"
      Then they should see the text "Enter a stronger password. Do not use very common passwords like ‘password’ or a sequence of numbers."

    @ci
    Scenario: The user wants to see or hide their password as they type it
      When they click on the forgot password link in their email
      Then they should see the text "Create a new password"
      When they toggle the "Show" link on the field "password"
      And they enter the password "PasswordIsShown"
      Then they see the toggle link "Hide" on the field "password"
      And they can see the content in the password field
      When they toggle the "Hide" link on the field "password"
      And they see the toggle link "Show" on the field "password"
      Then they can not see the content in the password field

    @ci @smoke
    Scenario: The user resends the email security code when resetting their password
      When they click the "Resend the email" button
      Then they should be redirected to the "/sign-in/forgot-password/enter-email-code" page

    Scenario: The user resets their password
      When they click on the forgot password link in their email
      And they submit a new valid password
      And they submit a correct security code
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "Your services"
      When they click Your account link in the left side navigation
      Then they should be redirected to the "/account" page
      And they should see the text "Last updated just now"
