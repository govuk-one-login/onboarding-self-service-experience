Feature: Users can only register with email addresses from certain domains

  Scenario Outline: User can register allowed email addresses

    Given the user is on the "/register" page
    When they submit the email <email>
    Then they should be redirected to the "/register/enter-email-code" page

    Examples:
      | email                                     |
      | "test-user@department.gov.uk"             |
      | "test-user@digital.cabinet-office.gov.uk" |
      | "test-user@highwaysengland.co.uk"         |
      | "test-user@socialworkengland.org.uk"      |

  Scenario Outline: User tries to register with a verboten email address

    Given the user is on the "/register" page
    When they submit the email <email>
    Then the error message "Enter a government email address" should be displayed for the email field

    Examples:
      | email                                                            |
      | "test-user@yahoo.co.uk"                                          |
      | "the-config-file-is-broken-add-a-dot-before-gov.uk@sneakygov.uk" |
