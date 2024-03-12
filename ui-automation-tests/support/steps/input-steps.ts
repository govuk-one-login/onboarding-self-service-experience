import {When, Then} from "@cucumber/cucumber";
import {enterTextIntoTextInput, checkErrorMessageDisplayedForField, clickSubmitButton} from "./shared-functions";
import {TestContext} from "../test-setup";
import {strict as assert} from "assert";

const fields = {
    name: "userName",
    email: "emailAddress",
    password: "password",
    serviceName: "serviceNameDisplayOnly",
    "security code": "securityCode",
    "organisation name": "organisationName",
    "mobile phone number": "mobileNumber",
    "service name": "serviceName",
    "new password": "newPassword",
    "current password": "currentPassword",
    "redirect uris": "redirectUris",
    "post logout redirect uris": "redirectUris",
    "change your public key": "serviceUserPublicKey"
};

When("they submit the {} {string}", async function (fieldName, value) {
    await enterTextIntoTextInput(this.page, value, fields[fieldName as keyof typeof fields]);
    await clickSubmitButton(this.page);
});

When("they enter the {} {string}", async function (fieldName, value) {
    await enterTextIntoTextInput(this.page, value, fields[fieldName as keyof typeof fields]);
});

When("they submit a correct security code", async function () {
    await enterTextIntoTextInput(this.page, "123456", fields["security code"]);
    await clickSubmitButton(this.page);
});

When("they submit a valid mobile phone number", async function () {
    await enterTextIntoTextInput(this.page, "07700 900123", fields["mobile phone number"]);
    await clickSubmitButton(this.page);
});

When("they submit a valid password", async function () {
    await enterTextIntoTextInput(this.page, "this-is-not-a-common-password", fields["password"]);
    await clickSubmitButton(this.page);
});

Then("the error message {string} must be displayed for the {} field", async function (errorMessage, fieldName) {
    const errorLink = await this.page.$x(`//div[@class="govuk-error-summary"]//a[@href="#${fields[fieldName as keyof typeof fields]}"]`);
    await checkErrorMessageDisplayedForField(this.page, errorLink, errorMessage, fields[fieldName as keyof typeof fields]);
});

Then("they can see the content in the {} field", async function (this: TestContext, fieldName) {
    const inputTypeValue = await this.page.$eval(`#${fields[fieldName as keyof typeof fields]}`, element => element.getAttribute("type"));
    assert.equal(inputTypeValue, "text");
});

Then("they can not see the content in the {} field", async function (this: TestContext, fieldName) {
    const inputTypeValue = await this.page.$eval(`#${fields[fieldName as keyof typeof fields]}`, element => element.getAttribute("type"));
    assert.equal(inputTypeValue, "password");
});

Then("the value of the text field {} should be {string}", async function (this: TestContext, fieldName, attributeValueToCheck: string) {
    const elementAttributeValue = await this.page.$eval(`#${fields[fieldName as keyof typeof fields]}`, element =>
        element.getAttribute("value")
    );
    assert.equal(elementAttributeValue, attributeValueToCheck);
});
Then("the input text field {} should be disabled", async function (this: TestContext, fieldName) {
    const isDisabled = await this.page.$eval(`#${fields[fieldName as keyof typeof fields]}[disabled]`, element => {
        return element !== null;
    });
    assert.strictEqual(true, isDisabled, new TypeError(fieldName + " is not disabled"));
});

// eslint-disable-next-line
When("they submit the value of {} {string} that {}", async function (fieldName, value, condition) {
    await enterTextIntoTextInput(this.page, value, fields[fieldName as keyof typeof fields]);
    await clickSubmitButton(this.page);
});
