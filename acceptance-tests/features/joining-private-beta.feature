Feature: Joining private beta

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@gds.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    When they click on the "Joining private beta" link
    Then they should be redirected to a page with the title "Joining private beta - GOV.UK One Login"

  Scenario: The user wants to find out more about private beta
    When they click on the "private beta guidance (opens in new tab)" link that opens in a new tab
    Then they should be directed to the URL "https://www.sign-in.service.gov.uk/getting-started/private-beta"
    And they should see the text "Find out more about private beta"

  Scenario: The user does not enter any characters into the name field
    When they submit the name ""
    Then the error message "Enter your name" should be displayed for the name field

  Scenario: The user does not enter any characters into the department name field
    When they submit the department name ""
    Then the error message "Enter your department" should be displayed for the department name field

  Scenario: The user’s data is replayed to them
    Then they should see the text "registered@gds.gov.uk"
    Then they should see the text "Test Service"

  Scenario: The user submits their private beta request
    When they enter the name "Test User"
    And they submit the department name "Test Department"
    Then they should be redirected to a page with the title "Private beta form submitted - GOV.UK One Login"

  Scenario: The user wants to contact the team via slack
    When they enter the name "Test User"
    And they submit the department name "Test Department"
    Then they should be redirected to a page with the title "Private beta form submitted - GOV.UK One Login"
    When they click on the "Slack channel" external link
    Then they should be directed to the URL "https://ukgovernmentdigital.slack.com/?redir=%2Farchives%2FC02AQUJ6WTC"

  Scenario: The user wants to contact the team via the support form
    When they enter the name "Test User"
    And they submit the department name "Test Department"
    Then they should be redirected to a page with the title "Private beta form submitted - GOV.UK One Login"
    When they click on the "support form" link
    Then they should be directed to the URL "https://www.sign-in.service.gov.uk/contact-us"
