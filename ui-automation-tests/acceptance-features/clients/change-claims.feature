Feature: Users can change their claims

  Background:
    Given the user is signed in
    And they goto on the test service page
    Then they click on the link that points to "/enter-identity-verification"
    And they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
    When they select the "Yes" radio button
    And they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the exact value "Yes" in the identity verification enabled field

  Rule: The user doesn't want to save changes on Change scopes page
    @ci @smoke
    Scenario: The user doesn't want to change any details on Change scopes page
      When they click on the link that points to "/change-claims"
      Then they should be redirected to a page with the title "Select claims - GOV.UK One Login"
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "Yes" in the identity verification enabled field

  Rule: The user tries to change their claims and then sets it back to original value
    @ci @smoke
    Scenario: The user wants to add email attribute
      When they click on the link that points to "/change-claims"
      Then they should be redirected to a page with the title "Select claims - GOV.UK One Login"
      When they click 'Address' claim checkbox
      And they click the Confirm button
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the text "You have changed your claims"
      And they should see the value 'Address' in the claims field
      When they click on the link that points to "/change-claims"
      Then they should see that 'Address' claim is checked
      When they click 'Address' claim checkbox
      And they click the Confirm button
      And they should not see the text "Address"

