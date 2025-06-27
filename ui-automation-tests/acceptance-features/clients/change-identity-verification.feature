Feature: Users can toggle identity verification

Background:
    Given the user is signed in
    And they goto on the test service page
    When they click on the link that points to "/enter-identity-verification"
    Then they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
    When they select the "No" radio button
    And they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the exact value "No" in the identity verification enabled field

Rule: The user can navigate back to the client page by clicking cancel
    @ci @smoke
    Scenario: The user clicks cancel
        Given they should see the exact value "No" in the identity verification enabled field
        Then they click on the link that points to "/enter-identity-verification"
        And they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
        When they click on the "Cancel" link
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the identity verification enabled field
        And they should not see the text "You have changed your identity verification"

Rule: The user can navigate back to the client page by clicking the back link
    @ci @smoke
    Scenario: The user clicks cancel
        Given they should see the exact value "No" in the identity verification enabled field
        Then they click on the link that points to "/enter-identity-verification"
        And they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
        When they click on the "Back" link
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the identity verification enabled field
        And they should not see the text "You have changed your identity verification"

Rule: The user can enable and then disable identity verification
    @ci @smoke
    Scenario: The user clicks yes and then confirm
        Given they should see the exact value "No" in the identity verification enabled field
        Then they click on the link that points to "/enter-identity-verification"
        And they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
        When they select the "Yes" radio button
        And they click the Confirm button
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "Yes" in the identity verification enabled field
        And they should see the exact value "Not added yet" in the claims field
        And they should see the text "You have enabled identity verification. It is strongly recommended that you set a landing page URI."
        Then they click on the link that points to "/enter-identity-verification"
        And they should be redirected to a page with the title "Enter Identity Verification - GOV.UK One Login"
        When they select the "No" radio button
        And they click the Confirm button
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the identity verification enabled field
