Feature: A contact form to resend the verification code to mobile

  Scenario: User doesn’t receive their code
    Given that the user is on the ‘Check your phone’ page 
    When they select the 'Not received a text message? link
    Then they should be directed to the ‘Resend security code’ page

  Scenario: The user wants to contact the service
    When they select the `support form` link
    Then they should be directed to the ‘/support’ page

  Scenario: The user wants to contact the service via slack
    When they select the ‘slack channel’ link
    Then they should be directed to 'https://ukgovernmentdigital.slack.com/archives/C02AQUJ6WTC'

  Scenario: The user wants the app to resend their code
    When they select the ‘Resend security code’ button
    Then they should be directed to the ‘/resend-phone-code’ page