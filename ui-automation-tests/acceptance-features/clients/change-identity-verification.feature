Feature: Users can toggle identity verification

Background:
    Given the user is on the "/sign-in" page
    And they submit the email "registered@test.gov.uk"
    And they submit a valid password
    And they submit a correct security code
    Then they should be redirected to a page with the title "Your services - GOV.UK One Login"
    When they click on the "Test Service" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    
Rule: The user can navigate back to the client page by clicking cancel
    Scenario: The user clicks cancel
        Given they should see the exact value "No" in the identity verification enabled field
        Then they click on the link that points to "/enter-identity-verification"
        And they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
        When they click on the "Cancel" link
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the identity verification enabled field
        And they should not see the text "You have changed your identity verification"

Rule: The user can navigate back to the client page by clicking the back link
    Scenario: The user clicks cancel
        Given they should see the exact value "No" in the identity verification enabled field
        Then they click on the link that points to "/enter-identity-verification"
        And they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
        When they click on the "Back" link
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the identity verification enabled field
        And they should not see the text "You have changed your identity verification"

Rule: The user can enable identity verification
    Scenario: The user clicks yes and then confirm
        Given they should see the exact value "No" in the identity verification enabled field
        Then they click on the link that points to "/enter-identity-verification"
        And they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
        When they select the "Yes" radio button
        And they click the Confirm button
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "Yes" in the identity verification enabled field
        And they should see the exact value "Not added yet" in the claims field
        And they should see the text "You have changed your identity verification"

Rule: The user can disable identity verification
    Scenario: The user clicks no and then confirm
        Given they should see the exact value "Yes" in the identity verification enabled field
        Then they click on the link that points to "/enter-identity-verification"
        And they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
        When they select the "No" radio button
        And they click the Confirm button
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the identity verification enabled field