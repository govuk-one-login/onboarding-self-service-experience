Feature: Users can change their scopes

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Rule: The user doesn't want to save changes on Change scopes page
    Scenario: The user doesn't want to change any details on Change scopes page
      Given they should see the exact value "OpenID" in the scopes field
      Then they click on the link that points to "/change-scopes"
      And they should be redirected to a page with the title "Change scopes - GOV.UK One Login"
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "OpenID" in the scopes field

  Rule: The user tries to change their scopes
    Scenario: The user wants to add email attribute
      Given they should see the exact value "OpenID" in the scopes field
      When they click on the link that points to "/change-scopes"
      Then they should be redirected to a page with the title "Change scopes - GOV.UK One Login"
      And they should see that Email option is not checked
      When they click 'email' checkbox
      And they click the Confirm button
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the text "You have changed your scopes"
      And they should see the value "Email address" in the scopes field
      When they click on the link that points to "/change-scopes"
      Then they should see that Email option is checked

    Scenario: The user wants to remove email attribute
      Given they should see the value "Email address" in the scopes field
      When they click on the link that points to "/change-scopes"
      Then they should be redirected to a page with the title "Change scopes - GOV.UK One Login"
      And they should see that Email option is checked
      When they click 'email' checkbox
      Then they click the Confirm button
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the text "You have changed your scopes"
      Then they should see the exact value "OpenID" in the scopes field
      When they click on the link that points to "/change-scopes"
      Then they should see that Email option is not checked
