Feature: Users can toggle PKCE enforced

Background:
    Given the user is signed in
    And they goto on the test service page
    When they click on the link that points to "/change-pkce-enforced"
    Then they should be redirected to a page with the title "Change PKCE Verification Enforcement - GOV.UK One Login"
    When they select the "No" radio button
    And they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the exact value "No" in the PKCE enforced field

Rule: The user can navigate back to the client page by clicking cancel
    @ci @smoke
    Scenario: The user clicks cancel
        Given they should see the exact value "No" in the PKCE enforced field
        Then they click on the link that points to "/change-pkce-enforced"
        And they should be redirected to a page with the title "Change PKCE Verification Enforcement - GOV.UK One Login"
        When they click on the "Cancel" link
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the PKCE enforced field
        And they should not see the text "You have changed your PKCE enforced"

Rule: The user can navigate back to the client page by clicking the back link
    @ci @smoke
    Scenario: The user clicks cancel
        Given they should see the exact value "No" in the PKCE enforced field
        Then they click on the link that points to "/change-pkce-enforced"
        And they should be redirected to a page with the title "Change PKCE Verification Enforcement - GOV.UK One Login"
        When they click on the "Back" link
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the PKCE enforced field
        And they should not see the text "You have changed your PKCE enforced"

Rule: The user can enable and then disable PKCE enforced
    @ci @smoke
    Scenario: The user clicks yes and then confirm
        Given they should see the exact value "No" in the PKCE enforced field
        Then they click on the link that points to "/change-pkce-enforced"
        And they should be redirected to a page with the title "Change PKCE Verification Enforcement - GOV.UK One Login"
        When they select the "Yes" radio button
        And they click the Confirm button
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "Yes" in the PKCE enforced field
        And they should see the text "You have changed your PKCE enforced"
        Then they click on the link that points to "/change-pkce-enforced"
        And they should be redirected to a page with the title "Change PKCE Verification Enforcement - GOV.UK One Login"
        When they select the "No" radio button
        And they click the Confirm button
        Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
        And they should see the exact value "No" in the PKCE enforced field
