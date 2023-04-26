Feature: Resending the security code to a mobile phone

  Background:
    Given the user is on the "/register" page
    And they submit the email "registering-successfully@gds.gov.uk"
    And they submit a correct security code
    And they submit a valid password
    And they submit a valid mobile phone number
    Then they should be redirected to the "/register/enter-text-code" page
    And they should see the text "Check your mobile phone"

  Scenario: User does not receive their code
    When they click on the "Problems receiving a text message?" link
    Then they should be redirected to the "/register/resend-text-code" page
    And they should see the text "Resend security code to your mobile phone"

  Scenario: The user wants to contact the service via slack
    When they click on the "Problems receiving a text message?" link
    And they click on the "Slack channel" external link
    Then they should be directed to the URL "https://ukgovernmentdigital.slack.com/?redir=%2Farchives%2FC02AQUJ6WTC"

  Scenario: The user wants to contact the service
    When they click on the "Problems receiving a text message?" link
    And they click on the "support form" link
    Then they should be directed to the URL "https://www.sign-in.service.gov.uk/support"

  Scenario: The user wants the app to resend their code
    When they click on the "Problems receiving a text message?" link
    Then they should be redirected to the "/register/resend-text-code" page
    And they should see the text "Resend security code to your mobile phone"
    When they click the "Resend security code" button
    Then they should be redirected to the "/register/enter-text-code" page
    And they should see the text "Check your mobile phone"
