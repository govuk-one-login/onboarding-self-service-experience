import {Then} from "@cucumber/cucumber";
import {TestContext} from "../test-setup";
import {strict as assert} from "assert";

const fields = {
    "redirect uris": "redirectUris",
    "redirect uri1": "redirectUri1",
    "redirect uri2": "redirectUri2",
    "redirect uri": "redirectUri",
    "post logout redirect uris": "postLogoutRedirectUris",
    scopes: "scopesUri",
    "post logout redirect uri 1": "postLogoutRedirectUri1",
    "post logout redirect uri 2": "postLogoutRedirectUri2",
    "user attributes": "userAttributes",
    "first redirect uri": "redirectUri1",
    "back channel logout uri": "backChannelLogoutUri",
    "sector identifier uri": "sectorIdentifierUri",
    "identity verification enabled": "idVerificationEnabledUri",
    claims: "claimsUri",
    "id token signing algorithm": "idTokenSigningAlgorithm",
    "PKCE enforced": "changePKCEEnforcedUri",
    "landing page url": "landingPageUrl"
};

Then("they should see the value for the Client ID {string}", async function (this: TestContext, text) {
    const bodyText = await this.page.$eval("#client-id-value", element => element.textContent);
    assert.equal(bodyText, text);
});

Then("they should only see the first 24 characters of the public key for their service", async function (this: TestContext) {
    const keyContainerContent = await this.page.$eval("#publicKeyShort", element => element.textContent);
    const elementVisibility = await this.page.$eval("#publicKeyShort", element => element.checkVisibility());
    assert.equal(keyContainerContent?.length, 28);
    assert.equal(elementVisibility, true);
});

Then("they click the toggle public key visibility button", async function (this: TestContext) {
    const element = await this.page.$("#togglePublicKey");
    await element?.click();
});

Then("they click the toggle 'What do these terms mean?' button", async function (this: TestContext) {
    const element = await this.page.$("#client-details-summary-toggle");
    await element?.click();
});

Then("the hidden content of 'What do these terms mean?' is displayed", async function (this: TestContext) {
    const elementIsOpen = await this.page.$eval("#client-details-summary", element => element.hasAttribute("open"));
    assert.equal(elementIsOpen, true);
});

Then("they should see the value {string} in the {} field", async function (this: TestContext, text, fieldName) {
    const elementText = await this.page.$eval(`#${fields[fieldName as keyof typeof fields]}`, element => element.textContent);
    assert.equal(elementText?.includes(text), true, `Element does not contain '${text}'`);
});

Then("they should not see the value {string} in the {} field", async function (this: TestContext, text, fieldName) {
    const elementText = await this.page.$eval(`#${fields[fieldName as keyof typeof fields]}`, element => element.textContent);
    assert.equal(elementText?.includes(text), false, `Element contains '${text}'`);
});

Then("they should see the exact value {string} in the {} field", async function (this: TestContext, text, fieldName) {
    const elementText = await this.page.$eval(`#${fields[fieldName as keyof typeof fields]}`, element => element.textContent);
    assert.equal(elementText?.trim(), text, `Element does not contain '${text}'`);
});

Then("they click 'email' checkbox", async function () {
    const emailCheckboxInput = await this.page.$("#scopes");
    if (!emailCheckboxInput) {
        throw new Error(`Could not find element with id #scopes`);
    }
    await emailCheckboxInput.click();
});

Then("they click 'Address' claim checkbox", async function () {
    const emailCheckboxInput = await this.page.$("#claims");
    if (!emailCheckboxInput) {
        throw new Error(`Could not find element with id #claims`);
    }
    await emailCheckboxInput.click();
});

Then("they should see that Email option is checked", async function (this: TestContext) {
    const emailIsChecked = await this.page.$eval("#scopes", element => element.hasAttribute("checked"));
    assert.equal(emailIsChecked, true);
});

Then("they should see that 'Address' claim is checked", async function (this: TestContext) {
    const emailIsChecked = await this.page.$eval("#claims", element => element.hasAttribute("checked"));
    assert.equal(emailIsChecked, true);
});

Then("they should see that Email option is not checked", async function (this: TestContext) {
    const emailIsChecked = await this.page.$eval("#scopes", element => element.hasAttribute("checked"));
    assert.equal(emailIsChecked, false);
});

Then("they should see that claims field is not present", async function (this: TestContext) {
    const exists = await this.page.$("#claimsUri");

    if (exists) {
        assert.fail("Claims field is present, which is unexpected.");
    } else {
        assert.ok("Claims field is not present, as expected.");
    }
});
