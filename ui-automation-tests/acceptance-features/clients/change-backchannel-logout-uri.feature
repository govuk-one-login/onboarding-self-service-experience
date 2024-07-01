Feature: Users can change their Back channel logout URI

    Background:
        Given the user is signed in
        And they goto on the test service page

    Rule: The user tries to change their Back channel logout URI
        Background:
            When they click on the link that points to "/change-back-channel-logout-uri"
            Then they should be redirected to a page with the title "Enter back channel logout URI - GOV.UK One Login"

        @ci @smoke
        Scenario Outline: user enters invalid URI as: <uri>
            When they submit the back channel logout uri "<uri>"
            Then the error message "<errorMsg>" must be displayed for the back channel logout uri field
            Examples:
                | uri              | errorMsg                                          |
                | someVerywrongURI | Enter your URIs in the format https://example.com |
                | http://test.com  | URIs must be https or http://localhost            |

        @ci @smoke
        Scenario: The user clicks "Cancel" on the Enter back channel logout URI page
            When they click on the "Cancel" link
            Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
            And they should see the exact value "Not added yet" in the back channel logout uri field

        @ci @smoke
        Scenario: The user clicks "Back" on the Enter back channel logout URI page
            When they click on the "Back" link
            Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
            And they should see the exact value "Not added yet" in the back channel logout uri field

        @ci @smoke
        Scenario: The user removes their Back channel logout URI by submitting empty value
            When they submit the back channel logout uri ""
            Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
            And they should not see the text "You have changed your Back channel logout URI"
            And they should see the exact value "Not added yet" in the back channel logout uri field

    Rule: The user updates their Back channel logout URI
        @ci @smoke
        Scenario: The user enters a valid back channel logout URI
            Given they should see the exact value "Not added yet" in the back channel logout uri field
            Then they click on the link that points to "/change-back-channel-logout-uri"
            And they should be redirected to a page with the title "Enter back channel logout URI - GOV.UK One Login"
            When they submit the back channel logout uri "http://localhost/backchannel"
            Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
            And they should see the text "You have changed your Back channel logout URI"
            And they should see the text "http://localhost/backchannel"
