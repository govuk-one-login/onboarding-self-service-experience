Feature: Users can update clients

  Background:
    And that the user is on the "/sign-in" page
    And the user submits the email "registered@gds.gov.uk"
    And the user submits the password "this-is-not-a-common-password"
    And the user submits the security code "123456"
    Then they should see the text "Client details"

  Rule:  the user updates their public key
    Scenario: the user submits a valid public key with headers
      Given they click on the link with the URL starting with "/change-public-key/"
      And the user submits a valid public key with headers
      Then they should be redirected to a page with the path starting with "/client-details"
      And they should see the text "You have changed your public key"

    Scenario: the user submits a valid public key without headers
      Given they click on the link with the URL starting with "/change-public-key/"
      And the user submits a valid public key without headers
      Then they should be redirected to a page with the path starting with "/client-details"
      And they should see the text "You have changed your public key"

    Scenario: the user submits a valid public key and it is displayed on the update public key screen
      Given they click on the link with the URL starting with "/change-public-key/"
      And the user submits a valid public key without headers
      Then they should be redirected to a page with the path starting with "/client-details"
      And they should see the text "You have changed your public key"
      And they click on the link with the URL starting with "/change-public-key/"
      Then they should see the public key they just entered in an inset text component
