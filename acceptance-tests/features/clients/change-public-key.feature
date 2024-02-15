Feature: Users can change their public key, and toggle visibility

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Rule: The user is on change your public key page
    Background: Go to change your public key page
      Given they click on the link that points to "/change-public-key"

    Scenario: User cancels the public key change
      When they click on the 'Cancel' link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

    Scenario: User validate the generate key pair link
      When they click on the 'generate a key pair (opens in new tab)' link that opens in a new tab
      Then they should be directed to the URL 'https://docs.sign-in.service.gov.uk/integrate-with-integration-environment/generate-a-key/'

    Scenario Outline: User submits invalid public key
      When they submit the change your public key '<keyValue>'
      Then the error message "Enter a valid public key" must be displayed for the change your public key field
      Examples:
        | keyValue |
        |          |
        | test     |

  Rule: The user adds their public key for the first time
    Scenario: They user submits a valid public key with headers
      Given the public key has not been added yet by the user
      When they click on the link that points to "/change-public-key"
      And they submit a valid public key with headers
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      And they should only see the first 24 characters of the public key for their service
      When they click the toggle public key visibility button
      Then they are able see their full public key
      When they click on the link that points to "/change-public-key"
      Then they should see the public key they just entered

  Rule: Public key show/hide functionality is available for the user
    Scenario: The user wants to see their full public key
      When they click the toggle public key visibility button
      Then they are able see their full public key

    Scenario: The user want to hide their public key data
      When they click the toggle public key visibility button
      Then they are able see their full public key
      When they click the toggle public key visibility button
      Then they should only see the first 24 characters of the public key for their service

  Rule: The user changes their public key by entering it in different formats
    Scenario Outline: The user submits a valid public key <keyVersion>
      When they click the toggle public key visibility button
      And they are able see their full public key
      Then they click on the link that points to "/change-public-key"
      And they submit a valid public key <keyVersion>
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      When they click the toggle public key visibility button
      Then they are able see their full public key
      When they click on the link that points to "/change-public-key"
      Then they should see the public key they just entered

      Examples:
        | keyVersion      |
        | with extra text |
        | without headers |

  Rule: The user changes their public key with different one
    Scenario: They user submits a different valid public key with headers
      When they click the toggle public key visibility button
      And they are able see their full public key
      Then they click on the link that points to "/change-public-key"
      When they submit a valid public key with different value
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      And they are able see the updated value for public key


    @accessible
    Rule: The user validate accessibility issues in public key page
    Scenario: User verifying the accessibility of /change-public-key page
      When they click on the link that points to "/change-public-key"
      Then there should be no accessibility violations
