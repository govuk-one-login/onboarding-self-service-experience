import {When} from "@cucumber/cucumber";
import {clickSubmitButton, enterTextIntoTextInput} from "./shared-functions";

When("the user enters {string} email", async function (email: string) {
    await this.goToPath("/sign-in");
    await enterTextIntoTextInput(this.page, email, "email");
    await clickSubmitButton(this.page);
    await enterTextIntoTextInput(this.page, "you-can-type-any-old-password-for-this-stub", "password");
    await clickSubmitButton(this.page);
});

When("the user enters {string} email and click continue", async function (email: string) {
    await this.goToPath("/sign-in");
    await enterTextIntoTextInput(this.page, email, "email");
    await clickSubmitButton(this.page);
});
