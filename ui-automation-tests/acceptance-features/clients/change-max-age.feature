Feature: Users can toggle max age

Background:
    Given the user is signed in
    And they goto on the test service page
    When they click on the link that points to "/change-max-age-enabled"
    Then they should be redirected to a page with the title "Enter Max Age - GOV.UK One Login"
    When they select the "No" radio button
    And they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the exact value "No" in the max age enabled field

Rule: The user can navigate back to the client page by clicking cancel
    Scenario: The user clicks cancel
        Given they should see the exact value "No" in the max age enabled field
        Then they click on the link that points to "/enter-max-age"
        And they should be redirected to a page with the title "Enter Max Age - GOV.UK One Login"
        When they click on the "Cancel" link
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the max age enabled field
        And they should not see the text "You have changed your max age"

Rule: The user can navigate back to the client page by clicking the back link
    Scenario: The user clicks cancel
        Given they should see the exact value "No" in the max age enabled field
        Then they click on the link that points to "/enter-max-age
        And they should be redirected to a page with the title "Enter Max Age - GOV.UK One Login"
        When they click on the "Back" link
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the max age enabled field
        And they should not see the text "You have changed your max age"

Rule: The user can enable max age
    Scenario: The user clicks yes and then confirm
        Given they should see the exact value "No" in the max age enabled field
        Then they click on the link that points to "/enter-max-age"
        And they should be redirected to a page with the title "Enter Max Age - GOV.UK One Login"
        When they select the "Yes" radio button
        And they click the Confirm button
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "Yes" in the max age enabled field
        And they should see the exact value "Not added yet" in the claims field
        And they should see the text "You have changed your max age"

Rule: The user can disable max age
    Scenario: The user clicks no and then confirm
        Given they should see the exact value "Yes" in the max age enabled field
        Then they click on the link that points to "/enter-max-age"
        And they should be redirected to a page with the title "Enter Max Age - GOV.UK One Login"
        When they select the "No" radio button
        And they click the Confirm button
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the max age enabled field