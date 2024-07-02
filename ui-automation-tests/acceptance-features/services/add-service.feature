Feature: Add a new service

  Background: User navigating to /services page
    Given the user is signed in

  Rule: The user tries to add a new service
    Background:
      When they click on the 'Add a new service' link

    Scenario: User adding a new service
      Then they should be redirected to a page with the title 'Add your service name - GOV.UK One Login'

    Scenario: User cancel adding the new service
      When they click on the 'Cancel' link
      Then they should be redirected to a page with the title "Your services - GOV.UK One Login"

    Scenario: User does not enter any characters in the service name field
      When they submit the service name ""
      Then the error message "Enter your service name" must be displayed for the service name field

    Scenario: User adding a service successfully
      When they submit the service name "Test Service"
      Then they should be redirected to the "/services/vice-id/clients" page
      And they should see the text 'Test Service'

