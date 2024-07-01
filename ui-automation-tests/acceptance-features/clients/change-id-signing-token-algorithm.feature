Feature: Users can update id token signing algorithm

    Background:
        Given the user is signed in
        And they goto on the test service page
        When they click on the link that points to "/change-id-token-signing-algorithm"
        Then they should be redirected to a page with the title "Select an ID token signing algorithm - GOV.UK One Login"

    Rule: User updates the ID token signing algorithm
        Scenario: The chooses RS256 as the ID token signing algorithm
            When they select the "RS256" radio button
            And they click the Confirm button
            Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
            And they should see the exact value "RS256" in the id token signing algorithm field
            And they should see the text "You have changed your ID token signing algorithm"
            And they click on the link that points to "/change-id-token-signing-algorithm"
            And "RS256" radio button is selected

        Scenario: The chooses ES256 as the ID token signing algorithm
            When they select the "ES256" radio button
            And they click the Confirm button
            Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
            And they should see the exact value "ES256" in the id token signing algorithm field
            And they should see the text "You have changed your ID token signing algorithm"
            And they click on the link that points to "/change-id-token-signing-algorithm"
            And "ES256" radio button is selected
