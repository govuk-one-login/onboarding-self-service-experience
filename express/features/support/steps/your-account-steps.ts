import {When} from "@cucumber/cucumber";
import {clickButtonWithId, clickLink, clickSubmitButton, enterTextIntoTextInput, getLink} from "./shared-functions";
import assert = require("assert");

When("the user has logged in and arrived on the your account page", async function () {
    await this.goToPath("/sign-in");
    await enterTextIntoTextInput(this.page, "registered@gds.gov.uk", "email");
    await clickSubmitButton(this.page);
    await enterTextIntoTextInput(this.page, "you-can-type-any-old-password-for-this-stub", "password");
    await clickButtonWithId(this.page, "continue");
    await enterTextIntoTextInput(this.page, "123123", "sms-otp");
    await clickButtonWithId(this.page, "continue");
    await clickLink(this.page, await getLink(this.page, "Your account"));
    assert.equal(await (await this.page).title(), "Your account - GOV.UK Sign In", "Expected to be on the 'Your account' page");
});
