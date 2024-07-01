Feature: A page where users can view the details associated with a client

  Background:
    Given the user is signed in
    And they goto on the test service page

  Rule: The the automatically generated details are available for the user to view
    @ci @smoke
    Scenario: The user is able to see the value for the field Client ID
      Then they should see the value for the Client ID "P0_ZdXojEGDlaZEU8Q9Zlv-fo1s"

    @ci @smoke
    Scenario: The user wants to view the user name and password for end journey
      Then they should see the text "Username: integration-user"
      And they should see the text "Password: winter2021"

  Rule: The the hidden content and the links which open in a new tab, are available for the user to view
    @ci @smoke
    Scenario: The user wants to view technical documentation
      When they click on the "technical documentation (opens in new tab)" link that opens in a new tab
      Then they should be directed to the URL "https://docs.sign-in.service.gov.uk/integrate-with-integration-environment"

    @ci @smoke
    Scenario: The user wants to view what different terms mean
      When they click the toggle 'What do these terms mean?' button
      Then the hidden content of 'What do these terms mean?' is displayed

    @ci @smoke
    Scenario: The user wants to know how to generate a keypair
      When they click the toggle 'What do these terms mean?' button
      And they click on the "technical documents on key pairs" link that opens in a new tab
      Then they should be directed to the URL "https://docs.sign-in.service.gov.uk/before-integrating/generate-a-key/"
