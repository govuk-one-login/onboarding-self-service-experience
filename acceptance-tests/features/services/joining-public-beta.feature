Feature: Joining public beta

  Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    When they click on the "Register to join public beta" link
    Then they should be redirected to a page with the title "Register to join public beta - GOV.UK One Login"

  Rule: user validating default populated fields
    Scenario: The user verify the email
      Then the value of the text field email should be "registered@test.gov.uk"
      And the input text field email should be disabled

    Scenario: The user verify the service name
      Then the value of the text field serviceName should be "Test Service"
      And the input text field serviceName should be disabled

  Rule: Applying for public beta
    Scenario: The user does not enter any characters into the Your full name field
      When they submit the name ""
      Then the error message "Enter your name" must be displayed for the name field

    Scenario: The user does not enter any characters into the Organisation name field
      When they submit the organisation name ""
      Then the error message "Enter your organisation name" must be displayed for the organisation name field

    Scenario: The user does not select and option in the How will your service use GOV.UK One Login? radio section
      When they try to submit the form without selecting any value from the radio button
      Then the error message "Service use is required" must be displayed for the "serviceUse" radios

    Scenario: The user does not select and option in the Do you need to migrate existing user accounts? radio section
      When they try to submit the form without selecting any value from the radio button
      Then the error message "Migration of existing accounts is required" must be displayed for the "migrateExistingAccounts" radios

    Scenario: The user submits their public beta request
      When they enter the name "Test User"
      And they enter the organisation name "Test Organisation"
      And they select the "To sign users in" radio button
      And they select the "Yes" radio button
      And they click the Submit button
      Then they should be redirected to a page with the title "Form sent - GOV.UK One Login"


  @accessible
  Rule: The user validate accessibility issues in /public-beta page
    Scenario: User verifying the accessibility of /change-post-logout-uris page
      When they click on the "Register to join public beta" link
      Then there should be no accessibility violations
