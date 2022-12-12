Feature: A contact form to resend the verification code to mobile

  Background:
    Given that the user is on the "/create/get-email" page
    And the user submits the email "registering-successfully@gds.gov.uk"
    And the user submits the security code "435553"
    And the user submits the password "this-is-not-a-common-password"
    And the user submits the mobile phone number "+447700900000"
    Then they should be redirected to the "/create/enter-mobile" page

  Scenario: User does not receive their code
    When they click on the "Problems receiving a text message?" link
    Then they should be redirected to the "/create/resend-phone-code" page

  Scenario: The user wants to contact the service via slack
    When they click on the "Problems receiving a text message?" link
    And they click on the "Slack channel" link
    Then they should be directed to the URL "https://ukgovernmentdigital.slack.com/?redir=%2Farchives%2FC02AQUJ6WTC"

  Scenario: The user wants to contact the service
    When they click on the "Problems receiving a text message?" link
    And they click on the "support form" link
    Then they should be directed to the URL "https://www.sign-in.service.gov.uk/support"

  Scenario: The user wants the app to resend their code
    When they click on the "Problems receiving a text message?" link
    And they click the Submit button
    Then they should be redirected to the "/create/resend-phone-code" page
