import { Given } from '@cucumber/cucumber';

Given('that the user has arrived on the "Check your email" page', async function () {
    await this.goToPath('/create/get-email');
    await this.page.type('#emailAddress', 'registering-successfully@gds.gov.uk');
    await this.page.waitForSelector('#submit');
    await this.page.click('#submit');
    await this.page.waitForSelector('#resend-code-page');
});
