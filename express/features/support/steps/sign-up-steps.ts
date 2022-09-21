import {When} from "@cucumber/cucumber";
import {clickSubmitButton, enterTextIntoTextInput} from "./shared-functions";

When("the user submits the email {string}", async function (email: string) {
    const emailInput = await this.page.$("#emailAddress");
    await emailInput.click({clickCount: 3});
    await emailInput.press("Backspace");
    await this.page.type("#emailAddress", email);
    await clickSubmitButton(this.page);
});

When("the user submits the email-otp {string}", async function (emailOtp: string) {
    await this.page.type("#create-email-otp", emailOtp);
    await clickSubmitButton(this.page);
});

When("the user submits the password {string}", async function (password: string) {
    await this.page.type("#password", password);
    await clickSubmitButton(this.page);
});

When("the user submits the mobile phone number {string}", async function (mobileNumber: string) {
    await this.page.type("#mobileNumber", mobileNumber);
    await clickSubmitButton(this.page);
});

When("the user submits the sms otp code {string}", async function (smsOtp: string) {
    await this.page.type("#sms-otp", smsOtp);
    await clickSubmitButton(this.page);
});

When("the user submits the service name {string}", async function (serviceName: string) {
    await this.page.type("#serviceName", serviceName);
    await clickSubmitButton(this.page);
});

When("the user submits a valid password", async function () {
    await enterTextIntoTextInput(this.page, "this-is-not-a-common-password", "password");
    await clickSubmitButton(this.page);
});

When("the user submits a common password", async function () {
    await enterTextIntoTextInput(this.page, "Password123", "password");
    await clickSubmitButton(this.page);
});

When("the user submits the correct email-otp", async function () {
    await enterTextIntoTextInput(this.page, "123123", "create-email-otp");
    await clickSubmitButton(this.page);
});

When("the user submits a valid mobile telephone number", async function () {
    await enterTextIntoTextInput(this.page, "07700 900123", "mobileNumber");
    await clickSubmitButton(this.page);
});

When("the user enters the correct sms-otp", async function () {
    await enterTextIntoTextInput(this.page, "123123", "sms-otp");
    await clickSubmitButton(this.page);
});

When("the user enters the correct service name", async function () {
    await enterTextIntoTextInput(this.page, "Test Service", "serviceName");
    await clickSubmitButton(this.page);
});
