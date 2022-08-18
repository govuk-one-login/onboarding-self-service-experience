import { Given } from '@cucumber/cucumber';
import {clickSubmitButton, enterTextIntoTextInput} from './shared-functions';

Given('that the user has arrived on the "Check your phone" page', async function () {
    await this.goToPath('/create/get-email');

    await enterTextIntoTextInput(this.page, 'registering-successfully@gds.gov.uk', 'emailAddress')
    await clickSubmitButton(this.page);

    await enterTextIntoTextInput(this.page, '435553', 'create-email-otp')
    await clickSubmitButton(this.page);

    await enterTextIntoTextInput(this.page, 'strongPassword', 'password')
    await clickSubmitButton(this.page);

    await enterTextIntoTextInput(this.page, '+447700900000', 'mobileNumber')
    await clickSubmitButton(this.page);
});
