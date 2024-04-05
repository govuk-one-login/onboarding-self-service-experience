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
      And they should see the text "registered@test.gov.uk"
      And they should see the text "mockuser2@gov.uk"
      And they should see the text "mockuser3@gov.uk"
      When they click on the link that points to "confirm-contact-removal?contactToRemove=mockuser3%40gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this contact? - GOV.UK One Login"
      When they select the "Yes" radio button
      And they click the Confirm button
      Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"
      And they should not see the text "mockuser3@gov.uk"

    Scenario: The user adds a contact to the contact list
      And they should see the text "registered@test.gov.uk"
      And they should see the text "mockuser2@gov.uk"
      And they should not see the text "mockuser4@gov.uk"
      And they click on the link that points to "/enter-contact-email"
      Then they should be redirected to a page with the title "Enter contact email address - GOV.UK One Login"
      When they submit the email "mockuser4@test.gov.uk"
      Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"
      And they should see the text "mockuser4@test.gov.uk"
      And they should see the text "Contacts updated"

    Scenario: The user wants to add a contact but changes his mind and clicks Cancel link on "Enter contact email address" page
      When they click on the link that points to "/enter-contact-email"
      Then they should be redirected to a page with the title "Enter contact email address - GOV.UK One Login"
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"

    Scenario: The user wants to remove a contact but changes his mind and submits No on "Enter contact email address" page
      When they click on the link that points to "confirm-contact-removal?contactToRemove=mockuser2%40gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this contact? - GOV.UK One Login"
      When they select the "No" radio button
      And they click the Confirm button
      Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"
