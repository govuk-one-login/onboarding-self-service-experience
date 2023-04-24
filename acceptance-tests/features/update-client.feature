Feature: Users can update clients

  Background:
    Given the user is on the "/sign-in" page
    And the user submits the email "registered@gds.gov.uk"
    And the user submits the password "this-is-not-a-common-password"
    And the user submits the security code "123456"
    Then they should see the text "Client details"

  Rule: The user updates their public key
    Scenario: They user submits a valid public key with headers
      Given they click on the link that points to "/change-public-key"
      And they submit a valid public key with headers
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      When they click on the link that points to "/change-public-key"
      Then they should see the public key they just entered

    Scenario: The user submits a valid public key with extra text
      Given they click on the link that points to "/change-public-key"
      And they submit a valid public key with extra text
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      When they click on the link that points to "/change-public-key"
      Then they should see the public key they just entered

    Scenario: The user submits a valid public key without headers
      Given they click on the link that points to "/change-public-key"
      And they submit a valid public key without headers
      Then they should be redirected to a page with the path starting with "/services"
      And they should see the text "You have changed your public key"
      When they click on the link that points to "/change-public-key"
      Then they should see the public key they just entered
