Feature: A page where users can view and change the details associated with their account

  Background:
    Given the user is signed in
    When they click Your account link in the left side navigation
    Then they should be redirected to the "/account" page
    And they should see the text "Your account"

  Rule: The user validate accessibility of your account pages
    Scenario: User verifying the accessibility of /change-post-logout-uris page
      Then there should be no accessibility violations

    Scenario: user verifying the accessibility of /change-phone-number page
      When they click on the link that points to "/account/change-phone-number"
      Then there should be no accessibility violations

    Scenario: user verifying the accessibility of /change-password page
      When they click on the link that points to "/account/change-password"
      Then there should be no accessibility violations
