import { Given } from '@cucumber/cucumber';

Given('that the user is on the `Check your phone` page', async function () {
    await this.goToPath('/create/get-email');
    await this.page.type('#emailAddress', 'registering-successfully@gds.gov.uk');
    await this.page.waitForSelector('#submit');
    await this.page.click('#submit');
    await this.page.waitForSelector('#create-email-otp');
    await this.page.waitForTimeout(1000)
    await this.page.type('#create-email-otp', '435553');
    await this.page.click('#submit')
    await this.page.waitForSelector('#password');
    await this.page.waitForTimeout(1000)
    await this.page.type('#password', 'strongPassword');
    await this.page.click('#submit');
    await this.page.waitForSelector('#mobileNumber');
    await this.page.waitForTimeout(1000)
    await this.page.type('#mobileNumber', '+447998708769');
    await this.page.click('#submit');
    await this.page.waitForTimeout(1000)
});
