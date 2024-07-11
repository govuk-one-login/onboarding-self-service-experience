Feature: Users can change their Redirect URIs

  Background:
    Given the user is signed in
    And they goto on the test service page

  Rule: The user tries to add a redirect uri, uses back and cancel buttons
    Background:
      Given they should see the exact value "http://localhost/" in the redirect uri1 field
      When they click on the link that points to "/change-redirect-uris"
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      When they click on the link that points to "/add-redirect-uri"
      Then they should be redirected to a page with the title "Enter redirect URI - GOV.UK One Login"

    @ci @smoke
    Scenario Outline: user enters invalid URI as: <uri>
      When they submit the redirect uri "<uri>"
      Then the error message "<errorMsg>" must be displayed for the redirect uri field
      Examples:
        | uri              | errorMsg                                          |
        |                  | Enter a URI                                      |
        | someVerywrongURI | Enter your URIs in the format https://example.com |
        | http://test.com  | URIs must be https or http://localhost            |

    @ci
    Scenario: The user clicks "Cancel" link on the Enter redirect URI page
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should see the text "http://localhost/"

    @ci
    Scenario: The user clicks "Back" link on the Enter redirect URI page
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should see the text "http://localhost/"

  Rule: The user adds redirect uri
    @ci @smoke
    Scenario: The user adds second redirect uri
      Given they should see the exact value "http://localhost/" in the redirect uri1 field
      When they click on the link that points to "/change-redirect-uris"
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should see the text "http://localhost/"
      And they they should not see a link that points to "/confirm-redirect-uri-removal?uriToRemove=http%3A%2F%2Flocalhost%2F"
      When they click on the link that points to "/add-redirect-uri"
      Then they should be redirected to a page with the title "Enter redirect URI - GOV.UK One Login"
      When they submit the redirect uri "https://testredirecturi2.gov.uk"
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should see the text "https://testredirecturi2.gov.uk"
      And they should see the text "http://localhost/"
      And they should see a link that points to "/confirm-redirect-uri-removal?uriToRemove=http%3A%2F%2Flocalhost%2F"
      And they should see a link that points to "/confirm-redirect-uri-removal?uriToRemove=https%3A%2F%2Ftestredirecturi2.gov.uk"
      And they should see the text "Redirect URIs updated"
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "https://testredirecturi2.gov.uk" in the redirect uri2 field
      And they should see the exact value "http://localhost/" in the redirect uri1 field

    @ci @smoke
    Scenario: The user tries to add an uri that already exists
      Given they should see the exact value "http://localhost/" in the redirect uri1 field
      When they click on the link that points to "/change-redirect-uris"
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should see the text "http://localhost/"
      When they click on the link that points to "/add-redirect-uri"
      Then they should be redirected to a page with the title "Enter redirect URI - GOV.UK One Login"
      When they submit the redirect uri "http://localhost/"
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should see the text "This URI has already been added"

    @ci
    Scenario: The user The user clicks the "Back" link on Manage redirect URIs page
      When they click on the link that points to "/change-redirect-uris"
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

    @ci @smoke
    Scenario: The user ties to remove a redirect uri, but does not select Yes or No on the confirmation page
      Given they should see the exact value "https://testredirecturi2.gov.uk" in the redirect uri2 field
      When they click on the link that points to "/change-redirect-uris"
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should see the text "https://testredirecturi2.gov.uk"
      When they click on the link that points to "/confirm-redirect-uri-removal?uriToRemove=https%3A%2F%2Ftestredirecturi2.gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this redirect URI? - GOV.UK One Login"
      When they click the Confirm button
      Then the error message "Select yes if you want to remove this redirect URI" must be displayed for the "removeUri" radios

    @ci @smoke
    Scenario: The user ties to remove a redirect uri, but changes his mind or selects the wrong url and selects No on the confirmation page
      Given they should see the exact value "https://testredirecturi2.gov.uk" in the redirect uri2 field
      When they click on the link that points to "/change-redirect-uris"
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should see the text "https://testredirecturi2.gov.uk"
      When they click on the link that points to "/confirm-redirect-uri-removal?uriToRemove=https%3A%2F%2Ftestredirecturi2.gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this redirect URI? - GOV.UK One Login"
      And they select the "No" radio button
      When they click the Confirm button
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should see the text "https://testredirecturi2.gov.uk"

    @ci @smoke
    Scenario: The user successfully removes a redirect uri
      Given they should see the exact value "https://testredirecturi2.gov.uk" in the redirect uri2 field
      When they click on the link that points to "/change-redirect-uris"
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should see the text "https://testredirecturi2.gov.uk"
      When they click on the link that points to "/confirm-redirect-uri-removal?uriToRemove=https%3A%2F%2Ftestredirecturi2.gov.uk"
      Then they should be redirected to a page with the title "Are you sure you want to remove this redirect URI? - GOV.UK One Login"
      And they select the "Yes" radio button
      When they click the Confirm button
      Then they should be redirected to a page with the title "Manage redirect URIs - GOV.UK One Login"
      And they should not see the text "https://testredirecturi2.gov.uk"
      And they should see the text "Redirect URIs updated"
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should not see the text "https://testredirecturi2.gov.uk"
