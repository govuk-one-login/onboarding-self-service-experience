Feature: Users can change their Sector identifier URI
  Background:
    Given the user is signed in
    And they goto on the test service page

  Rule: The user tries to change their Sector identifier URI
    Background:
      When they click on the link that points to "/change-sector-identifier-uri"
      Then they should be redirected to a page with the title "Enter sector identifier URI - GOV.UK One Login"

    @ci @smoke
    Scenario Outline: user enters invalid URI as: <uri>
      When they submit the sector identifier uri "<uri>"
      Then the error message "<errorMsg>" must be displayed for the sector identifier uri field
      Examples:
        | uri               | errorMsg                                          |
        |                   | Enter a URI                                      |
        | someVerywrongURI  | Enter your URIs in the format https://example.com |
        | http://test.com   | URIs must be https or http://localhost            |

    @ci @smoke
    Scenario: The user clicks "Cancel" on the Enter sector identifier URI
      When they click on the "Cancel" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "http://gov.uk" in the sector identifier uri field

    @ci @smoke
    Scenario: The user clicks "Back" on the Enter sector identifier URI
      When they click on the "Back" link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "http://gov.uk" in the sector identifier uri field

  Rule: The user to update Sector identifier URI
    @ci @smoke
    Scenario: The user successfully updates Sector identifier URI
      Given they should see the exact value "http://gov.uk" in the sector identifier uri field
      When they click on the link that points to "/change-sector-identifier-uri"
      Then they should be redirected to a page with the title "Enter sector identifier URI - GOV.UK One Login"
      When they submit the sector identifier uri "https://testsectoridentifieruri2.co.uk"
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
      And they should see the exact value "https://testsectoridentifieruri2.co.uk" in the sector identifier uri field
      And they should see the text "You have changed your Sector Identifier URI"
