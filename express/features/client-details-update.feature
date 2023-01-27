Feature: Client details update pages

  Background:
    Given that the user is on the "/sign-in" page
    And the user submits the email "registered@gds.gov.uk"
    And the user submits the password "this-is-not-a-common-password"
    And the user submits the security code "123456"
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Scenario: The user wants to change their service name
    When they click on the link with the URL starting with "/change-service-name"
    Then they should be redirected to a page with the title "Change service name - GOV.UK One Login"

  Scenario: The user wants to change their re-direct URIs
    When they click on the link with the URL starting with "/change-redirect-uris"
    Then they should be redirected to a page with the title "Change redirect URIs - GOV.UK One Login"

  Scenario: The user wants to change their user attributes
    When they click on the link with the URL starting with "/change-user-attributes"
    Then they should be redirected to a page with the title "Change user attributes - GOV.UK One Login"

  Scenario: The user wants to change their public key
    When they click on the link with the URL starting with "/change-public-key"
    Then they should be redirected to a page with the title "Change public key - GOV.UK One Login"

  Scenario: The user wants to change their Post logout redirect URIs
    When they click on the link with the URL starting with "/change-post-logout-uris"
    Then they should be redirected to a page with the title "Change post logout redirect URIs - GOV.UK One Login"

  Scenario: The user wants to see more details about the user attribute
    When they click on the link with the URL starting with "/change-user-attributes"
    Then they should be redirected to a page with the title "Change user attributes - GOV.UK One Login"
    When they click on the "user attributes (opens in new tab)" link that opens in a new tab
    Then they should be directed to the URL "https://docs.sign-in.service.gov.uk/integrate-with-integration-environment/choose-which-user-attributes-your-service-can-request/"
    And they should see the text "Choose which user attributes your service can request"

  Scenario: The user doesn't want to apply any changes on attributes while on 'Change user attributes' page
    Given only one attribute with the name 'openid' is displayed in the 'User attributes required' field
    When they click on the link with the URL starting with "/change-user-attributes"
    Then they should be redirected to a page with the title "Change user attributes - GOV.UK One Login"
    When they click on the "Cancel" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And only one attribute with the name 'openid' is displayed in the 'User attributes required' field

  Scenario: The user wants to add 'email' attribute
    Given the 'email' user attribute is not selected
    When they click on the link with the URL starting with "/change-user-attributes"
    Then they should be redirected to a page with the title "Change user attributes - GOV.UK One Login"
    Then they click 'email' checkbox
    When they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the text "You have changed your required user attributes"
    And the attribute with the name 'email' is displayed in the 'User attributes required' field

  Scenario: The user wants to remove 'email' attribute
    Given the attribute with the name 'email' is displayed in the 'User attributes required' field
    When they click on the link with the URL starting with "/change-user-attributes"
    Then they should be redirected to a page with the title "Change user attributes - GOV.UK One Login"
    Then they click 'email' checkbox
    When they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the text "You have changed your required user attributes"
    And the updated user attribute with name 'email' should not be displayed

  Scenario: The user's redirect URI data is replayed to them
    When they click on the link with the URL starting with "/change-redirect-uris"
    Then they should be redirected to a page with the title "Change redirect URIs - GOV.UK One Login"
    Then the value of the text field with the id "redirectUris" should be "http://localhost/"


  Scenario: The user doesn't enter any characters into the redirect URIs
    When they click on the link with the URL starting with "/change-redirect-uris"
    Then they should be redirected to a page with the title "Change redirect URIs - GOV.UK One Login"
    When they enter "" into the "redirectUris" field
    When they click the Confirm button
    Then the error message "Enter your redirect URIs" must be displayed for the "redirectUris" field

  Scenario: The user doesn't want to change any details on Change redirect URIs page
    When they click on the link with the URL starting with "/change-redirect-uris"
    Then they should be redirected to a page with the title "Change redirect URIs - GOV.UK One Login"
    When they click on the "Cancel" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Scenario: The user enters a valid redirect URIs on Change redirect URIs page
    When they click on the link with the URL starting with "/change-redirect-uris"
    Then they should be redirected to a page with the title "Change redirect URIs - GOV.UK One Login"
    When they enter "http://localhost/" into the "redirectUris" field
    When they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the text "http://localhost/"

  Scenario: The user doesn't want to save anything on the Change public key page
    When they click on the link with the URL starting with "/change-public-key"
    Then they should be redirected to a page with the title "Change public key - GOV.UK One Login"
    When they click on the "Cancel" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Scenario: The user doesn't add any characters into the public key field on the Change public key page
    When they click on the link with the URL starting with "/change-public-key"
    Then they should be redirected to a page with the title "Change public key - GOV.UK One Login"
    When they enter "" into the "serviceUserPublicKey" field
    When they click the Confirm button
    Then the error message "Enter a public key" must be displayed for the "serviceUserPublicKey" field

  Scenario: The user doesn't enter the public key in the right format on the Change public key page
    When they click on the link with the URL starting with "/change-public-key"
    Then they should be redirected to a page with the title "Change public key - GOV.UK One Login"
    When they enter "wrong key format" into the "serviceUserPublicKey" field
    When they click the Confirm button
    Then the error message "Enter a valid public key in PEM format, including the headers" must be displayed for the "serviceUserPublicKey" field

  Scenario: The user saves their new public key
    When they click on the link with the URL starting with "/change-public-key/"
    Then they should see the text "Change your public key"
    When they enter their public key:
      """
      -----BEGIN PUBLIC KEY-----
      MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCY6Mkl7zcoHQDkNMYeBD8Pde3J
      qEAr3iTULABJh9nc34aPSWBgpWhRhsIQeHrHDBzzGfMWFWWgIfcEpYayV+Kfj9QE
      Z4ubyUgOK7ZH0XBgPF/9cJ7o8p30lCUCxQFfXVZwdU9ATCiihzK9T4WGMTRHBYp+
      OxH2QQfp+0ONee0ZvQIDAQAB
      -----END PUBLIC KEY-----
      """
    When they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the text "You have changed your public key"
    When they click the element with the id "togglePublicKey"
    Then they should see the text "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCY6Mkl7zcoHQDkNMYeBD8Pde3JqEAr3iTULABJh9nc34aPSWBgpWhRhsIQeHrHDBzzGfMWFWWgIfcEpYayV+Kfj9QEZ4ubyUgOK7ZH0XBgPF/9cJ7o8p30lCUCxQFfXVZwdU9ATCiihzK9T4WGMTRHBYp+OxH2QQfp+0ONee0ZvQIDAQAB"

  Scenario: The user's data is replayed to them
    When they click on the link with the URL starting with "/change-public-key/"
    Then they should see the text "Change your public key"
    When they enter their public key:
      """
      -----BEGIN PUBLIC KEY-----
      MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCY6Mkl7zcoHQDkNMYeBD8Pde3J
      qEAr3iTULABJh9nc34aPSWBgpWhRhsIQeHrHDBzzGfMWFWWgIfcEpYayV+Kfj9QE
      Z4ubyUgOK7ZH0XBgPF/9cJ7o8p30lCUCxQFfXVZwdU9ATCiihzK9T4WGMTRHBYp+
      OxH2QQfp+0ONee0ZvQIDAQAB
      -----END PUBLIC KEY-----
      """
    When they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the text "You have changed your public key"
    When they click the element with the id "togglePublicKey"
    Then they should see the text "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCY6Mkl7zcoHQDkNMYeBD8Pde3JqEAr3iTULABJh9nc34aPSWBgpWhRhsIQeHrHDBzzGfMWFWWgIfcEpYayV+Kfj9QEZ4ubyUgOK7ZH0XBgPF/9cJ7o8p30lCUCxQFfXVZwdU9ATCiihzK9T4WGMTRHBYp+OxH2QQfp+0ONee0ZvQIDAQAB"
    When they click on the link with the URL starting with "/change-public-key/"
    Then they should see the text "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCY6Mkl7zcoHQDkNMYeBD8Pde3JqEAr3iTULABJh9nc34aPSWBgpWhRhsIQeHrHDBzzGfMWFWWgIfcEpYayV+Kfj9QEZ4ubyUgOK7ZH0XBgPF/9cJ7o8p30lCUCxQFfXVZwdU9ATCiihzK9T4WGMTRHBYp+OxH2QQfp+0ONee0ZvQIDAQAB"

  Scenario: The user doesn't want to save their Post logout redirect URIs
    When they click on the link with the URL starting with "/change-post-logout-uris"
    Then they should be redirected to a page with the title "Change post logout redirect URIs - GOV.UK One Login"
    When they click on the "Cancel" link
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Scenario: The user wants to save their new Post logout re-direct URIs
    When they click on the link with the URL starting with "/change-post-logout-uris"
    Then they should be redirected to a page with the title "Change post logout redirect URIs - GOV.UK One Login"
    When they enter "http://localhost/ http://localhost/logged_out" into the "redirectUris" field
    When they click the Confirm button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should see the text "http://localhost/logged_out"
    And they should see the text "You have changed your post-logout redirect URIs"
