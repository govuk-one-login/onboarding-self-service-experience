Feature: A page where users can view the details associated with a client

  Background:
    Given the user is signed in
    And they goto on the test service page

  Rule: The user validating the accessibility issues in Client details pages
    Scenario: User verifying the accessibility of /clients page
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /clients page
      When they click on the link that points to "/change-redirect-uris"
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /change-public-key page
      When they click on the link that points to "/change-public-key"
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /change-post-logout-uris page
      When they click on the link that points to "/change-post-logout-uris"
      Then there should be no accessibility violations

    Scenario: User verifying the accessibility of /clients page
      When they click on the link that points to "/change-scopes"
      Then there should be no accessibility violations
