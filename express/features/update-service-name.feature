Feature: Change your service name

  Background:
    Given that the user is on the "/sign-in/enter-email-address" page
    And the user submits the email "registered@gds.gov.uk"
    And the user submits the password "this-is-not-a-common-password"
    And the user submits the security code "123456"
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    When they click on the link with the URL starting with "/change-service-name"
    Then they should be redirected to a page with the title "Change service name - GOV.UK One Login"

  Scenario: The user does not enter any characters into the ‘Change your service name’ field
    When they enter "" into the "serviceName" field
    Then they click the "Confirm" button
    Then the error message "Enter your service name" must be displayed for the "serviceName" field

  Scenario: The user enters characters into the free text field
    When they enter "Updated Test Service" into the "serviceName" field
    Then they click the "Confirm" button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the text "You have changed your service name"
    And they should see the text "Updated Test Service"

  Scenario: The user User has changed their mind
    When they click on the "Cancel" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
