Feature: Users can change their post logout redirect uris

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Rule: The user tries to change their post logout redirect uris
    Background:
      When they click on the link that points to "/change-post-logout-uris"
      Then they should be redirected to a page with the title "Change post logout redirect URIs - GOV.UK One Login"

    Scenario: user validating the link  default GOV.UK sign out page
      When they click on the 'default GOV.UK sign out page' link
      Then they should be directed to the URL 'https://signin.account.gov.uk/signed-out'

    Scenario Outline: user enters invalid URI as: <uri>
      When they submit the post logout redirect uris "<uri>"
      Then the error message "<errorMsg>" must be displayed for the redirect uris field
      Examples:
        | uri              | errorMsg                                                   |
        |                  | Enter your redirect URIs                                   |
        | wrong url format | Enter your redirect URIs in the format https://example.com |
        | http://test.com  | URLs must be https (except for localhost)                  |

  Rule: The user doesn't want to save changes on Change post logout redirect URIs page
    Scenario: The user doesn't want to change any details on Change post logout redirect URIs page
      When they should see the exact value "http://localhost/ http://localhost/logged_out" in the post logout redirect uris field
      Then they click on the link that points to "/change-post-logout-uris"
      And they should be redirected to a page with the title "Change post logout redirect URIs - GOV.UK One Login"
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "http://localhost/ http://localhost/logged_out" in the post logout redirect uris field

  Rule: The user successfully changes their post logout redirect uris
    Scenario: The user enters a valid redirect URIs on Change redirect URIs page and the updated URIs are displayed on Client Details page
      Given they should see the exact value "http://localhost/ http://localhost/logged_out" in the post logout redirect uris field
      Then they click on the link that points to "/change-post-logout-uris"
      And they should be redirected to a page with the title "Change post logout redirect URIs - GOV.UK One Login"
      When they submit the post logout redirect uris "http://localhost/updated http://localhost/logged_out/updated"
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the text "You have changed your post-logout redirect URIs"
      And they should see the exact value "http://localhost/updated http://localhost/logged_out/updated" in the post logout redirect uris field
      When they click on the link that points to "/change-post-logout-uris"
      Then the value of the text field post logout redirect uris should be "http://localhost/updated http://localhost/logged_out/updated"
