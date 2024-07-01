import {When, Then} from "@cucumber/cucumber";
import {enterTextIntoTextInput, checkErrorMessageDisplayedForField, clickSubmitButton} from "./shared-functions";
import {TestContext} from "../test-setup";
import {strict as assert} from "assert";
import Chance from "chance";

const chance = new Chance.Chance();
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
    "redirect uri": "redirectUri",
    "post logout redirect uri": "postLogoutRedirectUri",
    "change your public key": "serviceUserPublicKey",
    "back channel logout uri": "backChannelLogoutUri",
    "sector identifier uri": "sectorIdentifierUri"
};

When("they submit the {} {string}", async function (fieldName, value) {
    await enterTextIntoTextInput(this.page, value, fields[fieldName as keyof typeof fields]);
    await clickSubmitButton(this.page);
});

When("they enter the {} {string}", async function (fieldName, value) {
    await enterTextIntoTextInput(this.page, value, fields[fieldName as keyof typeof fields]);
});

When("they submit a correct security code", async function (this: TestContext) {
    await enterTextIntoTextInput(this.page, this.otp_code, fields["security code"]);
    await clickSubmitButton(this.page);
});

When("they submit an incorrect security code", async function (this: TestContext) {
    await enterTextIntoTextInput(this.page, "666666", fields["security code"]);
    await clickSubmitButton(this.page);
});

When("they submit a valid mobile phone number {string}", async function (this: TestContext, mobile_number) {
    await enterTextIntoTextInput(this.page, mobile_number, fields["mobile phone number"]);
    await clickSubmitButton(this.page);
    this.mobile = mobile_number
});

When("they submit a valid password", async function (this: TestContext) {
    const new_password = `new_valid_${chance.string({length: 20})}`;

    await enterTextIntoTextInput(this.page, new_password, fields["password"]);
    await clickSubmitButton(this.page);
    this.password = new_password
});

Then("the error message {string} must be displayed for the {} field", async function (errorMessage, fieldName) {
    const errorLink = await this.page.$$(
        `::-p-xpath(//div[@class="govuk-error-summary"]//a[@href="#${fields[fieldName as keyof typeof fields]}"])`
    );
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
