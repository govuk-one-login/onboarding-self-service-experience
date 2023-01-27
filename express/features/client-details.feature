Feature: Client details

  Background:
    Given that the user is on the "/sign-in" page
    And the user submits the email "registered@gds.gov.uk"
    And the user submits the password "this-is-not-a-common-password"
    And the user submits the security code "123456"
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"

  Scenario: The user wants to view the user name and password for end journey
    Then they should see the text "Username: integration-user"
    Then they should see the text "Password: winter2021"

  Scenario: The user wants to view their public key data
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
    When they click the Submit button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should only see the first 24 characters of the public key for their service


  Scenario: The user wants to see all of their public key
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
    When they click the Submit button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should only see the first 24 characters of the public key for their service
    When they click the element with the id "togglePublicKey"
    Then they should see the text "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCY6Mkl7zcoHQDkNMYeBD8Pde3JqEAr3iTULABJh9nc34aPSWBgpWhRhsIQeHrHDBzzGfMWFWWgIfcEpYayV+Kfj9QEZ4ubyUgOK7ZH0XBgPF/9cJ7o8p30lCUCxQFfXVZwdU9ATCiihzK9T4WGMTRHBYp+OxH2QQfp+0ONee0ZvQIDAQAB"

  Scenario: The user want to hide their public key data
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
    When they click the Submit button
    Then they should be redirected to a page with the title "Client details - GOV.UK One Login"
    And they should only see the first 24 characters of the public key for their service
    When they click the element with the id "togglePublicKey"
    Then they should see the text "MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCY6Mkl7zcoHQDkNMYeBD8Pde3JqEAr3iTULABJh9nc34aPSWBgpWhRhsIQeHrHDBzzGfMWFWWgIfcEpYayV+Kfj9QEZ4ubyUgOK7ZH0XBgPF/9cJ7o8p30lCUCxQFfXVZwdU9ATCiihzK9T4WGMTRHBYp+OxH2QQfp+0ONee0ZvQIDAQAB"
    When they click the element with the id "togglePublicKey"
    Then they should only see the first 24 characters of the public key for their service

  Scenario: The user wants to view technical documentation
    When they click on the "technical documentation (opens in new tab)" link that opens in a new tab
    Then they should be directed to the URL "https://docs.sign-in.service.gov.uk/integrate-with-integration-environment/"
    And they should see the text "Integrate with GOV.UK One Login’s integration environment"

  Scenario: The user wants to know how to generate a keypair
    When they click the element with the id "client-details-summary-toggle"
    When they click on the "generate a key pair (opens in new tab)" link that opens in a new tab
    Then they should be directed to the URL "https://auth-tech-docs.london.cloudapps.digital/integrate-with-integration-environment/generate-a-key/"
    And they should see the text "Generate a key pair"

  Scenario: The user wants to view what different terms mean
    When they click the element with the id "client-details-summary-toggle"
    Then the hidden content of the element with id "client-details-summary" is displayed

  Scenario: The user wants to join private beta
    When they click on the "Joining private beta" link
    Then they should be redirected to a page with the title "Joining private beta - GOV.UK One Login"

  Scenario: Client ID is automatically generated for the user
    Then they should see the text "P0_ZdXojEGDlaZEU8Q9Zlv-fo1s"
