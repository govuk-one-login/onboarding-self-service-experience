Feature: Joining private beta

  Background:
    Given that the user is on the "/sign-in/enter-email-address" page
    And the user submits the email "registered@gds.gov.uk"
    And the user submits the password "this-is-not-a-common-password"
    And the user submits the security code "123456"
    Then they should see the text "Client details"
    When they click on the "Joining private beta" link
    Then they should be redirected to a page with the title "Joining private beta - GOV.UK One Login"

  Scenario: The user wants to find out more about private beta
    When they click on the "private beta guidance (opens in new tab)" link that opens in a new tab
    Then they should be directed to the URL "https://www.sign-in.service.gov.uk/getting-started/private-beta"
    And they should see the text "Find out more about private beta"

  Scenario: The user does not enter any characters into the Your name field
    When they enter "" into the "userName" field
    When they click the Continue button
    Then the error message "Enter your name" must be displayed for the "userName" field

  Scenario: The user does not enter any characters into the Department field
    When they enter "" into the "department" field
    When they click the Continue button
    Then the error message "Enter your department" must be displayed for the "department" field

  Scenario: The user’s data is replayed to them
    Then they should see the text "registered@gds.gov.uk"
    Then they should see the text "Test Service"

  Scenario: The user submits their private beta request
    When they enter "Test User" into the "userName" field
    When they enter "Test Department" into the "department" field
    When they click the Submit button
    Then they should be redirected to a page with the title "Private beta form submitted - GOV.UK One Login"

  Scenario: The user wants to contact the team via slack
    When they enter "Test User" into the "userName" field
    When they enter "Test Department" into the "department" field
    When they click the Submit button
    Then they should be redirected to a page with the title "Private beta form submitted - GOV.UK One Login"
    When they click on the "Slack channel" link
    Then they should be directed to the URL "https://ukgovernmentdigital.slack.com/?redir=%2Farchives%2FC02AQUJ6WTC"

  Scenario: The user wants to contact the team via the support form
    When they enter "Test User" into the "userName" field
    When they enter "Test Department" into the "department" field
    When they click the Submit button
    Then they should be redirected to a page with the title "Private beta form submitted - GOV.UK One Login"
    When they click on the "support form" link
    Then they should be directed to the URL "https://www.sign-in.service.gov.uk/contact-us"
