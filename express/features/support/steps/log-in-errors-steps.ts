import {When} from "@cucumber/cucumber";
import {clickSubmitButton, enterTextIntoTextInput} from "./shared-functions";

When("they enter {string} into the text-field with the id {string}", async function (inputText: string, inputFieldId: string) {
    await enterTextIntoTextInput(this.page, inputText, inputFieldId);
});

When("the user enters the password {string} into the password field and submits it", async function (password: string) {
    await this.page.type("#password", password);
    await clickSubmitButton(this.page);
});
