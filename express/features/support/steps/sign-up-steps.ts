import { When } from "@cucumber/cucumber";
import {clickButtonWithId, clickSubmitButton, enterTextIntoTextInput} from "./shared-functions";

When('the user submits the email {string}', async function (email: string) {
    let emailInput = await this.page.$('#emailAddress');
    await emailInput.click({clickCount: 3});
    await emailInput.press('Backspace');
    await this.page.type("#emailAddress", email);
    await clickSubmitButton(this.page);
});

When('the user submits a valid password', async function () {
    await enterTextIntoTextInput(this.page, "this-is-not-a-common-password", "password");
    await clickSubmitButton(this.page);
});

When('the user submits a common password', async function () {
    await enterTextIntoTextInput(this.page, "Password123", "password");
    await clickSubmitButton(this.page);
});

When('the user submits the correct email-otp', async function () {
    await enterTextIntoTextInput(this.page, "123123", "create-email-otp");
    await clickSubmitButton(this.page);
});

When('the user submits a valid mobile telephone number', async function () {
    await enterTextIntoTextInput(this.page, "07700 900123", "mobileNumber");
    await clickSubmitButton(this.page);
});

When('the user enters the correct sms-otp', async function () {
    await enterTextIntoTextInput(this.page, "123123", "sms-otp");
    await clickButtonWithId(this.page, 'continue');
});
