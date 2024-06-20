Feature: Users can change their claims

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    Then they click on the link that points to "/enter-identity-verification"
    And they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
    When they select the "Yes" radio button
    And they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the exact value "Yes" in the identity verification enabled field

#  Rule: The user doesn't want to save changes on Change scopes page
#    Scenario: The user doesn't want to change any details on Change scopes page
#      Given they should see the exact value "OpenID" in the scopes field
#      Then they click on the link that points to "/change-scopes"
#      And they should be redirected to a page with the title "Change scopes - GOV.UK One Login"
#      When they click on the "Cancel" link
#      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
#      And they should see the exact value "OpenID" in the scopes field

  Rule: The user tries to change their claims and then sets it back to original value
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

#    Scenario: The user wants to remove email attribute
#      Given they should see the value "Email address" in the scopes field
#      When they click on the link that points to "/change-scopes"
#      Then they should be redirected to a page with the title "Change scopes - GOV.UK One Login"
#      And they should see that Email option is checked
#      When they click 'email' checkbox
#      Then they click the Confirm button
#      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
#      And they should see the text "You have changed your scopes"
#      Then they should see the exact value "OpenID" in the scopes field
#      When they click on the link that points to "/change-scopes"
#      Then they should see that Email option is not checked
