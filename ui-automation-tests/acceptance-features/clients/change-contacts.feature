Feature: Users can update contacts

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they click on the link that points to "/enter-contact"
    Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"

  Rule: User updates the contacts
    Scenario: The user removes a contact from the contact list
      When they click on the link that points to "confirm-contact-removal?contactToRemove=mockuser3%40gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this contact? - GOV.UK One Login"
      When they select the "Yes" radio button
      And they click the Confirm button
      Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"
      
