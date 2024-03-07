Feature: A page where users can view the details associated with a client

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Rule: The user validating the accessibility issues in Client details pages
    Scenario: User verifying the accessibility of /clients page
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /clients page
      When they click on the link that points to "/change-redirect-uris"
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /clients page
      When they click on the link that points to "/change-user-attributes"
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /change-public-key page
      When they click on the link that points to "/change-public-key"
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /change-post-logout-uris page
      When they click on the link that points to "/change-post-logout-uris"
      Then there should be no accessibility violations
