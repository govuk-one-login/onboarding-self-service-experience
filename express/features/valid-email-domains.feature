Feature: Users can only register with email addresses from certain domains

  Scenario Outline: User can register allowed email addresses

    Given that the user is on the "/create/get-email" page
    When the user submits the email <email>
    Then they should be directed to the following page: "/create/check-email"

    Examples:
      | email                                     |
      | "test-user@department.gov.uk"             |
      | "test-user@digital.cabinet-office.gov.uk" |
      | "test-user@highwaysengland.co.uk"         |
      | "test-user@socialworkengland.org.uk"      |

  Scenario Outline: User tries to register with a verboten email address

    Given that the user is on the "/create/get-email" page
    When the user submits the email <email>
    Then the error message "Enter a government email address" must be displayed for the "emailAddress" field

    Examples:
      | email                                                            |
      | "test-user@yahoo.co.uk"                                          |
      | "the-config-file-is-broken-add-a-dot-before-gov.uk@sneakygov.uk" |
