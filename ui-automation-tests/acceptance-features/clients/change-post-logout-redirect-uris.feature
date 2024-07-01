Feature: Users can change their Post logout redirect URIs

  Background:
    Given the user is signed in
    And they goto on the test service page

  Rule: The user tries to add a Post logout redirect URI
    Background:
      Given they should see the exact value "Not added yet" in the post logout redirect uris field
      When they click on the link that points to "/add-post-logout-uri"
      Then they should be redirected to a page with the title "Enter post logout redirect URI - GOV.UK One Login"

    Scenario Outline: user enters invalid URI as: <uri>
      When they submit the post logout redirect uri "<uri>"
      Then the error message "<errorMsg>" must be displayed for the post logout redirect uri field
      Examples:
        | uri              | errorMsg                                          |
        |                  | Enter a URI                                      |
        | someVerywrongURI | Enter your URIs in the format https://example.com |
        | http://test.com  | URIs must be https or http://localhost            |

    Scenario: The user clicks "Cancel" on the add post logout uri page
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "Not added yet" in the post logout redirect uris field

    Scenario: The user clicks the "Back" link on the add a post logout URI page
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "Not added yet" in the post logout redirect uris field

  Rule: The user adds or removes post logout redirect uris, uses back and cancel buttons
    Scenario: The user adds first post logout redirect uri
      Given they should see the exact value "Not added yet" in the post logout redirect uris field
      When they click on the link that points to "/add-post-logout-uri"
      Then they should be redirected to a page with the title "Enter post logout redirect URI - GOV.UK One Login"
      When they submit the post logout redirect uri "https://testpostlogoutredirecturi1.gov.uk"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should see the text "https://testpostlogoutredirecturi1.gov.uk"
      And they should see the text "Post logout redirect URIs updated"
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "https://testpostlogoutredirecturi1.gov.uk" in the post logout redirect uris field

    Scenario: The user adds second post logout redirect uri
      Given they should see the exact value "https://testpostlogoutredirecturi1.gov.uk" in the post logout redirect uris field
      And they should not see the text "https://testpostlogoutredirecturi2.gov.uk"
      When they click on the link that points to "/change-post-logout-uris"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should see the text "https://testpostlogoutredirecturi1.gov.uk"
      And they should not see the text "https://testpostlogoutredirecturi2.gov.uk"
      When they click on the link that points to "/add-post-logout-uri"
      Then they should be redirected to a page with the title "Enter post logout redirect URI - GOV.UK One Login"
      When they submit the post logout redirect uri "https://testpostlogoutredirecturi2.gov.uk"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should see the text "https://testpostlogoutredirecturi2.gov.uk"
      And they should see the text "Post logout redirect URIs updated"
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "https://testpostlogoutredirecturi1.gov.uk" in the post logout redirect uri 1 field
      And they should see the exact value "https://testpostlogoutredirecturi2.gov.uk" in the post logout redirect uri 2 field

    Scenario: The user tries to add an uri that already exists
      Given they should see the exact value "https://testpostlogoutredirecturi1.gov.uk" in the post logout redirect uri 1 field
      When they click on the link that points to "/change-post-logout-uris"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should see the text "https://testpostlogoutredirecturi1.gov.uk"
      When they click on the link that points to "/add-post-logout-uri"
      When they submit the post logout redirect uri "https://testpostlogoutredirecturi1.gov.uk"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should see the text "Not updated. URI already exists"

    Scenario: The user The user clicks the "Back" link on Manage post logout redirect URIs page
      When they click on the link that points to "/change-post-logout-uris"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

    Scenario: The user clicks the "Back" link on the add a post logout URI page when at least one URI is already added
      When they click on the link that points to "/change-post-logout-uris"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      When they click on the link that points to "/add-post-logout-uri"
      Then they should be redirected to a page with the title "Enter post logout redirect URI - GOV.UK One Login"
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"

    Scenario: The user clicks the "Cancel" link on the add a post logout URI page when at least one URI is already added
      When they click on the link that points to "/change-post-logout-uris"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      When they click on the link that points to "/add-post-logout-uri"
      Then they should be redirected to a page with the title "Enter post logout redirect URI - GOV.UK One Login"
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"

    Scenario: The user ties to remove a redirect uri, but does not select Yes or No on the confirmation page
      Given they should see the text "https://testpostlogoutredirecturi1.gov.uk"
      When they click on the link that points to "/change-post-logout-uris"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should see the text "https://testpostlogoutredirecturi1.gov.uk"
      When they click on the link that points to "/confirm-post-logout-uri-removal?uriToRemove=https%3A%2F%2Ftestpostlogoutredirecturi1.gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this post logout redirect URI? - GOV.UK One Login"
      When they click the Confirm button
      Then the error message "Select yes if you want to remove this post logout redirect URI" must be displayed for the "removeUri" radios

    Scenario: The user ties to remove a post logout redirect uri, but changes his mind or selects the wrong url and selects No on the confirmation page
      Given they should see the text "https://testpostlogoutredirecturi1.gov.uk"
      When they click on the link that points to "/change-post-logout-uris"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should see the text "https://testpostlogoutredirecturi1.gov.uk"
      When they click on the link that points to "/confirm-post-logout-uri-removal?uriToRemove=https%3A%2F%2Ftestpostlogoutredirecturi1.gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this post logout redirect URI? - GOV.UK One Login"
      And they select the "No" radio button
      When they click the Confirm button
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should see the text "https://testpostlogoutredirecturi1.gov.uk"

    Scenario: The user successfully removes a post logout redirect uri
      Given they should see the text "https://testpostlogoutredirecturi1.gov.uk"
      When they click on the link that points to "/change-post-logout-uris"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should see the text "https://testpostlogoutredirecturi1.gov.uk"
      When they click on the link that points to "/confirm-post-logout-uri-removal?uriToRemove=https%3A%2F%2Ftestpostlogoutredirecturi1.gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this post logout redirect URI? - GOV.UK One Login"
      And they select the "Yes" radio button
      When they click the Confirm button
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should not see the text "https://testpostlogoutredirecturi1.gov.uk"
      And they should see the text "Post logout redirect URIs updated"
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should not see the text "https://testpostlogoutredirecturi1.gov.uk"

    Scenario: The user successfully removes all post logout redirect uris
      Given they should see the text "https://testpostlogoutredirecturi2.gov.uk"
      When they click on the link that points to "/change-post-logout-uris"
      Then they should be redirected to a page with the title "Manage post logout redirect URIs - GOV.UK One Login"
      And they should see the text "https://testpostlogoutredirecturi2.gov.uk"
      When they click on the link that points to "/confirm-post-logout-uri-removal?uriToRemove=https%3A%2F%2Ftestpostlogoutredirecturi2.gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this post logout redirect URI? - GOV.UK One Login"
      And they select the "Yes" radio button
      When they click the Confirm button
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the text "You have changed your Post logout redirect URIs"
      And they should see the exact value "Not added yet" in the post logout redirect uris field
      And they should not see the text "https://testpostlogoutredirecturi2.gov.uk"
