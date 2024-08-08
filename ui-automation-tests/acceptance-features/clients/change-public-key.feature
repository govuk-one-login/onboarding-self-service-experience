Feature: Users can change their static public key, and toggle visibility

  Background:
    Given the user is signed in
    And they goto on the test service page

  Rule: The user is on change your public key page
    Background: Go to change your public key page
      Given they click on the link that points to "/change-public-key"

    @ci
    Scenario: User cancels the public key change
      When they click on the 'Cancel' link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

    @ci @smoke
    Scenario Outline: User submits invalid public key
      When they select the "Static Key" radio button
      When they submit the change your static key '<keyValue>'
      Then the error message "Enter a valid public key" must be displayed for the change your static key field
      Examples:
        | keyValue |
        |          |
        | test     |

  Rule: The user adds their public key for the first time
    @ci @smoke
    Scenario: The user submits a valid public key with headers
      Given the public key has not been added yet by the user
      When they click on the link that points to "/change-public-key"
      When they select the "Static Key" radio button
      And they submit a public key with headers
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      And they should only see the first 24 characters of the public key for their service
      When they click the toggle public key visibility button
      Then they are able see their public key "without headers"
      When they click on the link that points to "/change-public-key"
      Then their public key is prefilled "without headers"

  Rule: Public key show/hide functionality is available for the user
    @ci @smoke
    Scenario: The user wants to see their full public key
      When they click the toggle public key visibility button
      Then they are able see their public key "without headers"

    @ci @smoke
    Scenario: The user want to hide their public key data
      When they click the toggle public key visibility button
      Then they are able see their public key "without headers"
      When they click the toggle public key visibility button
      Then they should only see the first 24 characters of the public key for their service

  Rule: The user changes their public key by entering it in different formats
    @ci @smoke
    Scenario Outline: The user submits a valid public key <keyVersion>
      When they click the toggle public key visibility button
      And they are able see their public key "without headers"
      Then they click on the link that points to "/change-public-key"
      When they select the "Static Key" radio button
      And they submit a public key <keyVersion>
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      When they click the toggle public key visibility button
      Then they are able see their public key "without headers"
      When they click on the link that points to "/change-public-key"
      Then their public key is prefilled "without headers"

      Examples:
        | keyVersion      |
        | with extra text |
        | without headers |

  Rule: The user changes their public key with different one
    @ci @smoke
    Scenario: They user submits a different valid public key with headers
      When they click the toggle public key visibility button
      And they are able see their public key "without headers"
      Then they click on the link that points to "/change-public-key"
      When they select the "Static Key" radio button
      And they submit a public key with different value
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      And they should only see the first 24 characters of the public key for their service

  Rule: The user changes their public key to an invalid one and cancels
    @ci @smoke
    Scenario: They user submits a different valid public key with headers
      When they click the toggle public key visibility button
      And they are able see their public key "with different value"
      Then they click on the link that points to "/change-public-key"
      When they select the "Static Key" radio button
      And they submit a public key with bad value
      Then they should see the text "There is a problem"
      And they should see the text "Enter a valid public key"
      When they click on the 'Cancel' link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Rule: The user changes their public key to a blank one and cancels
    @ci @smoke
    Scenario: They user submits a different valid public key with headers
      When they click the toggle public key visibility button
      And they are able see their public key "with different value"
      Then they click on the link that points to "/change-public-key"
      When they select the "Static Key" radio button
      And they submit a public key with blank value
      Then they should see the text "There is a problem"
      And they should see the text "Enter a valid public key"
      When they click on the 'Cancel' link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Rule: The user changes their public key to an invalid one and corrects it
    @ci @smoke
    Scenario: They user submits a different valid public key with headers
      When they click the toggle public key visibility button
      And they are able see their public key "with different value"
      Then they click on the link that points to "/change-public-key"
      When they select the "Static Key" radio button
      And they submit a public key with bad value
      Then they should see the text "There is a problem"
      And they should see the text "Enter a valid public key"
      When they submit a public key with headers
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      And they should only see the first 24 characters of the public key for their service
      When they click the toggle public key visibility button
      Then they are able see their public key "without headers"
      When they click on the link that points to "/change-public-key"
      Then their public key is prefilled "without headers"
















  Rule: The user is on change your public key page
    Background: Go to change your public key page
      Given they click on the link that points to "/change-public-key"
    @ci @smoke
    Scenario Outline: User submits invalid URL
      When they select the "JWKs URL" radio button
      When they submit the change your jwks url '<keyValue>'
      Then the error message "Enter a valid JWKs URL" must be displayed for the change your jwks url field
      Examples:
        | keyValue |
        |          |
        | test     |

  Rule: The user adds their public key for the first time
    @ci @smoke
    Scenario: The user submits a valid public key with headers
      When they click on the link that points to "/change-public-key"
      When they select the "JWKs URL" radio button
      And they submit a jwks url "with valid url"
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      And they should only see the first 24 characters of the public key for their service
      When they click the toggle public key visibility button
      Then they are able see their jwks url "with valid url"
      When they click on the link that points to "/change-public-key"
      Then their jwks url is prefilled "with valid url"

  Rule: The user changes their public key with different one
    @ci @smoke
    Scenario: They user submits a different valid public key with headers
      When they click the toggle public key visibility button
      And they are able see their jwks url "with valid url"
      Then they click on the link that points to "/change-public-key"
      When they select the "JWKs URL" radio button
      And they submit a jwks url "with different url"
      Then they should be redirected to a page with the path starting with "/services"
      When they click the toggle public key visibility button
      And they should see the text "You have changed your public key"
      And they are able see their jwks url "with different url"

  Rule: The user changes their public key to an invalid one and cancels
    @ci @smoke
    Scenario: They user submits a different valid public key with headers
      When they click the toggle public key visibility button
      And they are able see their jwks url "with different url"
      Then they click on the link that points to "/change-public-key"
      When they select the "JWKs URL" radio button
      And they submit a jwks url "with bad url"
      Then they should see the text "There is a problem"
      And they should see the text "Enter a valid JWKs URL"
      When they click on the 'Cancel' link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Rule: The user changes their public key to a blank one and cancels
    @ci @smoke
    Scenario: They user submits a different valid public key with headers
      When they click the toggle public key visibility button
      And they are able see their jwks url "with different url"
      Then they click on the link that points to "/change-public-key"
      When they select the "JWKs URL" radio button
      And they submit a jwks url "with blank value"
      Then they should see the text "There is a problem"
      And they should see the text "Enter a valid JWKs URL"
      When they click on the 'Cancel' link
      Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Rule: The user changes their public key to an invalid one and corrects it
    @ci @smoke
    Scenario: They user submits a different valid public key with headers
      When they click the toggle public key visibility button
      And they are able see their jwks url "with different url"
      Then they click on the link that points to "/change-public-key"
      When they select the "JWKs URL" radio button
      And they submit a jwks url "with bad url"
      Then they should see the text "There is a problem"
      And they should see the text "Enter a valid JWKs URL"
      When they submit a jwks url "with valid url"
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      When they click the toggle public key visibility button
      Then they are able see their jwks url "with valid url"
      When they click on the link that points to "/change-public-key"
      Then their jwks url is prefilled "with valid url"

