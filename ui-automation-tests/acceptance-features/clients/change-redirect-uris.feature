Feature: Users can change their redirect uris

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Rule: The user tries to change their redirect uris
    Background:
      When they click on the link that points to "/change-redirect-uris"
      Then they should be redirected to a page with the title "Change redirect URIs - GOV.UK One Login"
    Scenario Outline: user enters an invalid URI
      When they submit the redirect uris "<uri>"
      Then the error message "<errorMsg>" must be displayed for the redirect uris field
      Examples:
        | uri              | errorMsg                                                   |
        |                  | Enter your redirect URIs                                   |
        | wrong url format | Enter your redirect URIs in the format https://example.com |
        | http://test.com  | URLs must be https (except for localhost)                  |

  Rule: The user doesn't want to save changes on Change redirect URIs page
    Scenario: The user doesn't want to change any details on Change redirect URIs page
      Given they should see the exact value "http://localhost/" in the first redirect uri field
      Then they click on the link that points to "/change-redirect-uris"
      And they should be redirected to a page with the title "Change redirect URIs - GOV.UK One Login"
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "http://localhost/" in the first redirect uri field

  Rule: The user successfully changes their redirect uris
    Scenario: The user enters a valid redirect URIs on Change redirect URIs page and the updated URIs are displayed on Client Details page and Change redirect URIs page
      Given they should see the exact value "http://localhost/" in the first redirect uri field
      Then they click on the link that points to "/change-redirect-uris"
      And they should be redirected to a page with the title "Change redirect URIs - GOV.UK One Login"
      When they submit the redirect uris "http://localhost/updated"
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the text "You have changed your redirect URIs"
      And they should see the exact value "http://localhost/updated" in the first redirect uri field
      When they click on the link that points to "/change-redirect-uris"
      Then the value of the text field redirect uris should be "http://localhost/updated"
