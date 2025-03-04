Feature: Users can sign up to the self-service experience

  Background:
    Given the user is on the "/register" page

  Rule: The user tries to submit an email address when creating an account
    @ci
    Scenario Outline: user submits an invalid email address
      When they submit the email "<email>"
      Then the error message "<errorMsg>" must be displayed for the email field

      @smoke
      Examples:
        | email                               | errorMsg                                                            |
        | testuser.invalid.a941d@sneakygov.uk | Enter a government email address                                    |

      Examples:
        | email                               | errorMsg                                                            |
        |                                     | Enter your email address                                            |
        | testuser.invalid.5dacb@yahoo.co.uk  | Enter a government email address                                    |
        | testuser.invalid.a941d@sneakygov.uk | Enter a government email address                                    |
        | testuser.invalid.ef444.yahoo.com    | Enter an email address in the correct format, like name@example.com |

  Rule: Users can only register with email addresses from certain domains
    @ci @smoke
    Scenario: User can register allowed email addresses
      When they submit a random valid email address
      Then they should be redirected to the "/register/enter-email-code" page

  Rule: User validating the links in registration page
    @ci
    Scenario Outline:User validating links in enter-email address page
      Given the user is on the '/register' page
      When they click on the '<linkName>' link
      Then they should be redirected to the '<address>'
      Examples:
        | linkName       | address               |
        | Contact us     | /contact-us?adminTool |
        | privacy notice | /privacy-policy       |

  Rule: The user tries to submit an email address that is already registered
    @ci @smoke
    Scenario: The user is offered to sign in and signs in instead
      When they submit the current username correctly
      Then they should be redirected to the "/register/account-exists" page
      And they should see the text "An account already exists with the email address"
      When they submit their password
      And they submit a correct security code
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "Your services"

    @ci
    Scenario Outline: The user signIn with incorrect password
      When they submit the current username correctly
      Then they should be redirected to the "/register/account-exists" page
      And they should see the text "An account already exists with the email address"
      When they submit the password "<password>"
      Then the error message "<errorMsg>" must be displayed for the password field

      @smoke
      Examples:
        | password      | errorMsg            |
        | WrongPa$$word | Incorrect password  |

      Examples:
        | password      | errorMsg            |
        |               | Enter your password |

  Rule: The user is navigating back to previous page using back link
    @ci
    Scenario: User navigates back to /enter-email-address page from email code page
      Given they submit the email "testuser.valid-email@digital.cabinet-office.gov.uk"
      When they click on the "Back" link
      Then they should be redirected to the "/register/enter-email-address" page

    @ci
    Scenario: User navigates back to /enter-email-address from account exists page
      When they submit the current username correctly
      When they click on the "Back" link
      Then they should be redirected to the "/register/enter-email-address" page

  Rule: The user tries to verify email security code when creating an account
    Background:
      Given they submit a random valid email address
      Then they should be redirected to the "/register/enter-email-code" page

    @ci
    Scenario Outline: the user enters an invalid email code
      When they submit an incorrect security code "<code>"
      Then the error message "<errorMsg>" must be displayed for the security code field
      And they should see the text "We have sent an email to:"

      @smoke
      Examples:
        | code   | errorMsg                                                                                  |
        | 12345A | Your security code should only include numbers                                            |

      Examples:
        | code   | errorMsg                                                                                  |
        |        | Enter the 6 digit security code                                                           |
        | 000000 | The code you entered is not correct or has expired - enter it again or request a new code |

  Rule: The user is locked out when submitting 6 incorrect code attempts
    Background:
      When they submit an incorrect security code "000000"
      Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the security code field
      When they submit an incorrect security code "000000"
      Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the security code field
      When they submit an incorrect security code "000000"
      Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the security code field
      When they submit an incorrect security code "000000"
      Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the security code field
      When they submit an incorrect security code "000000"
      Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the security code field
      When they submit an incorrect security code "000000"
      Then the error message "The code you entered is not correct or has expired - enter it again or request a new code" must be displayed for the security code field
      When they submit an incorrect security code "000000"
       Then they should be redirected to a page with the title "You've entered too many security codes"


  Rule: The user does not receive their email security code and clicks 'Not received an email?' link
    Background:
      Given they submit a random valid email address
      Then they should be redirected to the "/register/enter-email-code" page
      And they click on the "Not received an email?" link
      Then they should be redirected to the "/register/resend-email-code" page

    @ci
    Scenario: The user tries to resend their code using the application
      And they click the Resend security code button
      Then they should be redirected to the "/register/enter-email-code" page

    Scenario: The user does not receive their email security and wants to contact the service via slack
      When they click on the "Slack channel" external link
      Then they should be directed to the URL "https://ukgovernmentdigital.slack.com/?redir=%2Farchives%2FC02AQUJ6WTC"

    @ci
    Scenario: The user does not receive their email security and wants to contact the service via support form
      When they click on the "support form" link
      Then they should be redirected to the "/contact-us"

  Rule: The user tries to set a password when creating an account
    Background:
      Given they submit a random valid email address
      And they submit a correct email code
      Then they should be redirected to the "/register/create-password" page

    @ci
    Scenario Outline: The user tries to set an invalid password
      When they submit the password "<password>"
      Then they should be redirected to the "/register/create-password" page
      And they should see the text "<errorMsg>"

      @smoke
      Examples:
        | password    | errorMsg                                                                                              |
        | Pa$1GOv     | Your password must be 8 characters or more                                                            |

      Examples:
        | password    | errorMsg                                                                                              |
        |             | Enter a password                                                                                      |
        | Password123 | Enter a stronger password. Do not use very common passwords like ‘password’ or a sequence of numbers. |

    @ci
    Scenario: The user wants to see or hide their password as they type it
      When they toggle the "Show" link on the field "password"
      And they enter the password "PasswordIsShown"
      Then they see the toggle link "Hide" on the field "password"
      And they can see the content in the password field
      When they toggle the "Hide" link on the field "password"
      And they see the toggle link "Show" on the field "password"
      Then they can not see the content in the password field

  Rule: The user tries to add a phone number when creating an account
    Background:
      Given they submit a random valid email address
      And they submit a correct email code
      And they submit a new valid password
      Then they should be redirected to the "/register/enter-phone-number" page

    @ci
    Scenario Outline: user enters an invalid phone number
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

  Rule: The user tries to verify the SMS security code when creating an account
    Background:
      Given they submit a random valid email address
      And they submit a correct email code
      And they submit a new valid password
      And they submit a valid mobile phone number "07700 900100"
      Then they should be redirected to the "/register/enter-text-code" page
      And they should see the text "We sent a code to: 07700 900100"

    @ci
    Scenario Outline: The user submits an invalid otp code
      When they submit an incorrect security code "<code>"
      Then the error message "<errorMsg>" must be displayed for the security code field
      And they should see the text "We sent a code to: 07700 900100"

      @smoke
      Examples:
        | code    | errorMsg                                                                                  |
        | 12345   | Enter the security code using only 6 digits                                               |

      Examples:
        | code    | errorMsg                                                                                  |
        |         | Enter the 6 digit security code                                                           |
        | 1234567 | Enter the security code using only 6 digits                                               |
        | 12345A  | Your security code should only include numbers                                            |
        | 12345$  | Your security code should only include numbers                                            |
        | 666666  | The code you entered is not correct or has expired - enter it again or request a new code |

    @ci
    Scenario: User does not receive their code
      When they click on the "Problems receiving a text message?" link
      Then they should be redirected to the "/register/resend-text-code" page
      And they should see the text "Resend security code to your mobile phone"

    @ci
    Scenario: The user wants to contact the service via slack
      When they click on the "Problems receiving a text message?" link
      And they click on the "Slack channel" external link
      Then they should be directed to the URL "https://ukgovernmentdigital.slack.com/?redir=%2Farchives%2FC02AQUJ6WTC"

    @ci
    Scenario: The user wants to contact the service
      When they click on the "Problems receiving a text message?" link
      And they click on the "support form" link
      Then they should be directed to the URL "https://www.sign-in.service.gov.uk/contact-us?adminTool"

    @ci
    Scenario: The user wants the app to resend their code
      When they click on the "Problems receiving a text message?" link
      Then they should be redirected to the "/register/resend-text-code" page
      And they should see the text "Resend security code to your mobile phone"
      When they click the "Resend security code" button
      Then they should be redirected to the "/register/enter-text-code" page
      And they should see the text "Check your mobile phone"

  Rule: The user tries to add a service when creating an account
    Background:
      Given they submit a random valid email address
      And they submit a correct email code
      And they submit a new valid password
      And they submit a valid mobile phone number "07700 900900"
      And they submit a correct security code
      Then they should be redirected to the "/register/create-service" page

    @ci
    Scenario: The user submits an empty service name
      When they submit the service name ""
      Then they should be redirected to the "/register/create-service" page
      And the error message "Enter your service name" must be displayed for the service name field

    @ci
    Scenario: The user types everything correctly, creates an account and adds a service
      When they submit the service name "Test Service"
      Then they should see the text "Manage Test Service"
