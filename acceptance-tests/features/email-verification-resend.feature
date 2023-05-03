Feature: A contact form to resend the verification code to email

  Background:
    Given the user is on the "/register" page
    And they submit the email "registering-successfully@gds.gov.uk"
    Then they should be redirected to the "/register/enter-email-code" page

  Scenario: User does not receive their code
    When they click on the "Not received an email?" link
    Then they should be redirected to the "/register/resend-email-code" page

  Scenario: The user wants to contact the service via slack
    When they click on the "Not received an email?" link
    And they click on the "Slack channel" external link
    Then they should be directed to the URL "https://ukgovernmentdigital.slack.com/?redir=%2Farchives%2FC02AQUJ6WTC"

  Scenario: The user wants to contact the service
    When they click on the "Not received an email?" link
    And they click on the "support form" link
    Then they should be directed to the URL "https://www.sign-in.service.gov.uk/support"

  Scenario: The user wants the app to resend their code
    When they click on the "Not received an email?" link
    And they click the Submit button
    Then they should be redirected to the "/register/enter-email-code" page
