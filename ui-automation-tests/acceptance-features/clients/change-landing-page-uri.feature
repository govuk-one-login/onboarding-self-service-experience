Feature: Users can change their Landing page URI
  Background:
    Given the user is signed in
    And they goto on the test service page

  Rule: The user tries to change their Landing page URI
    Background:
      When they click on the link that points to "/change-landing-page-url"
      Then they should be redirected to a page with the title "Enter landing page URI - GOV.UK One Login"

    @ci @smoke
    Scenario Outline: user enters invalid URI as: <uri>
      When they submit the landing page url "<uri>"
      Then the error message "<errorMsg>" must be displayed for the landing page url field
      Examples:
        | uri               | errorMsg                                          |
        |                   | Enter a URI                                      |
        | someVerywrongURI  | Enter your URIs in the format https://example.com |

    @ci @smoke
    Scenario: The user clicks "Cancel" on the Enter landing page URI
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "Not added yet" in the landing page url field

    @ci @smoke
    Scenario: The user clicks "Back" on the Enter landing page URI
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "Not added yet" in the landing page url field

  Rule: The user to update landing page URI
    @ci @smoke
    Scenario: The user successfully updates Landing page URI
      Given they should see the exact value "Not added yet" in the landing page url field
      When they click on the link that points to "/change-landing-page-url"
      Then they should be redirected to a page with the title "Enter landing page URI - GOV.UK One Login"
      When they submit the landing page url "https://landing-page.co.uk"
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "https://landing-page.co.uk" in the landing page url field
      And they should see the text "You have changed your Landing page URI"
