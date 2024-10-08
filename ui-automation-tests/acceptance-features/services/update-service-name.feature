Feature: Change your service name

  Background:
    Given the user is signed in
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    When they click on the link that points to "/change-service-name"
    Then they should be redirected to a page with the title "Change service name - GOV.UK One Login"

  Scenario: The user does not enter any characters into the ‘Change your service name’ field
    When they submit the service name ""
    Then the error message "Enter your service name" must be displayed for the service name field

  Scenario: The user enters characters into the free text field
    When they submit the service name "Updated Test Service"
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the text "You have changed your service name"
    And they should see the text "Updated Test Service"

  Scenario: The user User has changed their mind
    When they click on the "Cancel" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the text "Test Service"
