import { Given } from '@cucumber/cucumber';
import { clickSubmitButton } from './shared-functions';

Given('that the user has arrived on the "Check your phone" page', async function () {
    await this.goToPath('/create/get-email');

    await this.page.type('#emailAddress', 'registering-successfully@gds.gov.uk');
    await clickSubmitButton(this.page);

    await this.page.type('#create-email-otp', '435553');
    await clickSubmitButton(this.page);

    await this.page.type('#password', 'strongPassword');
    await clickSubmitButton(this.page);

    await this.page.type('#mobileNumber', '+447998708769');
    await clickSubmitButton(this.page);
});
