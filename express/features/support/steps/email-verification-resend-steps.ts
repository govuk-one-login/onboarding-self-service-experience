import {Given} from "@cucumber/cucumber";
import {clickSubmitButton, enterTextIntoTextInput} from "./shared-functions";

Given('that the user has arrived on the "Check your email" page', async function () {
    await this.goToPath("/create/get-email");
    await enterTextIntoTextInput(this.page, "registering-successfully@gds.gov.uk", "emailAddress");
    await clickSubmitButton(this.page);
    await this.page.waitForSelector("#resend-code-page");
});
