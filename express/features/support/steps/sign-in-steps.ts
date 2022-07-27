import { When } from "@cucumber/cucumber";

When('the user registers the email {string}', async function (email: string) {
    let emailInput = await this.page.$('#emailAddress');
    await emailInput.click({ clickCount: 3 });
    await emailInput.press('Backspace');
    await this.page.type("#emailAddress", email);
    await Promise.all(
        [
            this.page.waitForNavigation({ timeout: 10000 }),
            this.page.click('#submit')
        ]
    )
});
