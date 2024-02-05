Feature: Users can change their user attributes

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Rule: The user want to validate the links on the page

    Scenario: user validating the link user attributes (opens in new tab)
      Given they click on the link that points to "/change-user-attributes"
      When they click on the 'user attributes (opens in new tab)' link that opens in a new tab
      Then they should be directed to the URL 'https://docs.sign-in.service.gov.uk/integrate-with-integration-environment/choose-which-user-attributes-your-service-can-request/'


  Rule: The user doesn't want to save changes on Change user attributes page

    Scenario: The user doesn't want to change any details on Change user attributes page
      Given they should see the exact value "OpenID" in the user attributes field
      Then they click on the link that points to "/change-user-attributes"
      And they should be redirected to a page with the title "Change user attributes - GOV.UK One Login"
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "OpenID" in the user attributes field

  Rule: The user tries to change their attributes

    Scenario: The user wants to add email attribute
      Given they should see the exact value "OpenID" in the user attributes field
      When they click on the link that points to "/change-user-attributes"
      Then they should be redirected to a page with the title "Change user attributes - GOV.UK One Login"
      And they should see that Email option is not checked
      When they click 'email' checkbox
      And they click the Confirm button
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the text "You have changed your required user attributes"
      And they should see the value "Email address" in the user attributes field
      When they click on the link that points to "/change-user-attributes"
      Then they should see that Email option is checked

    Scenario: The user wants to remove email attribute
      Given they should see the value "Email address" in the user attributes field
      When they click on the link that points to "/change-user-attributes"
      Then they should be redirected to a page with the title "Change user attributes - GOV.UK One Login"
      And they should see that Email option is checked
      When they click 'email' checkbox
      Then they click the Confirm button
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the text "You have changed your required user attributes"
      Then they should see the exact value "OpenID" in the user attributes field
      When they click on the link that points to "/change-user-attributes"
      Then they should see that Email option is not checked
