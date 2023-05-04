import {When, Then} from "@cucumber/cucumber";
import {enterTextIntoTextInput, checkErrorMessageDisplayedForField, clickSubmitButton} from "./shared-functions";

const fields = {
    name: "userName",
    email: "emailAddress",
    password: "password",
    "security code": "securityCode",
    "department name": "department",
    "mobile phone number": "mobileNumber",
    "service name": "serviceName",
    "new password": "newPassword",
    "current password": "currentPassword"
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
