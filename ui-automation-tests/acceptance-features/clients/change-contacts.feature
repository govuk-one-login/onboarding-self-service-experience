Feature: Users can update contacts

  Background:
    Given the user is signed in
    And they goto on the test service page
    When they click on the link that points to "/enter-contact"
    Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"

  Rule: User updates the contacts
    @ci @smoke
    Scenario: The user adds a contact to the contact list and then removes it
      And they should see their email address
      And they should not see the text "testuser.mock.2@digital.cabinet-office.gov.uk"
      And they click on the link that points to "/enter-contact-email"
      Then they should be redirected to a page with the title "Enter contact email address - GOV.UK One Login"
      When they submit the email "testuser.mock.2@digital.cabinet-office.gov.uk"
      Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"
      And they should see the text "testuser.mock.2@digital.cabinet-office.gov.uk"
      And they should not see the text "testuser.mock.3@digital.cabinet-office.gov.uk"
      And they should see the success message "Contacts updated"
      When they click on the link that points to "confirm-contact-removal?contactToRemove=testuser.mock.2%40digital.cabinet-office.gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this contact? - GOV.UK One Login"
      When they select the "Yes" radio button
      And they click the Confirm button
      Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"
      And they should see the success message "Contacts updated"
      And they should not see the text "testuser.mock.2@digital.cabinet-office.gov.uk"

    @ci
    Scenario: The user wants to add a contact but changes his mind and clicks Cancel link on "Enter contact email address" page
      When they click on the link that points to "/enter-contact-email"
      Then they should be redirected to a page with the title "Enter contact email address - GOV.UK One Login"
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"

    @ci
    Scenario: The user wants to remove a contact but changes his mind and submits No on "Enter contact email address" page
      When they click on the link that points to "confirm-contact-removal?contactToRemove=mockuser2%40gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this contact? - GOV.UK One Login"
      When they select the "No" radio button
      And they click the Confirm button
      Then they should be redirected to a page with the title "Enter contacts - GOV.UK One Login"
