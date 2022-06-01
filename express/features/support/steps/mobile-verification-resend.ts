
   
import {Given, When, Then} from "@cucumber/cucumber";

Given('that the user is on the ‘Check your phone’ page', async function () {
    await this.goToPath('/create/get-email');
    await this.page.type("#email", 'tessa.ting@foo-bar.gov.uk');
    await this.page.waitForSelector('#submit');
    await this.page.click('#submit')
    await this.goToPath('/create/check-email');
    await this.page.type("#otp", '43553');
    await this.page.click('#submit')
    await this.goToPath('/create/update-password');
    await this.page.type("#password", 'strongPassword');
    await this.page.type("#confirmPassword", 'strongPassword');
    await this.page.click('#submit');
    await this.goToPath('/create/enter-mobile');
    await this.page.type("#mobile-number", '+447998708769');
    await this.page.click('#submit');
    await this.page.waitForSelector('#otp');    
    await this.page.type("#otp", '43553');
    await this.page.click('#resend-code-page')
  });

  When('they select the `support form` link', async function () {
    await this.goToPath('/create/get-email');
    await this.page.type("#email", 'tessa.ting@foo-bar.gov.uk');
    await this.page.waitForSelector('#submit');
    await this.page.click('#submit')
    await this.goToPath('/create/check-email');
    await this.page.type("#otp", '43553');
    await this.page.click('#submit')
    await this.goToPath('/create/update-password');
    await this.page.type("#password", 'strongPassword');
    await this.page.type("#confirmPassword", 'strongPassword');
    await this.page.click('#submit');
    await this.goToPath('/create/enter-mobile');
    await this.page.type("#mobile-number", '+447998708769');
    await this.page.click('#submit');
    await this.page.waitForSelector('#otp');    
    await this.page.type("#otp", '43553');
    await this.page.click('#resend-code-page')
    await this.goToPath('/create/resend-phone-code');
    await this.page.click('#support-form');
  });

  When('they select the ‘slack channel’ link', async function () {
    await this.goToPath('/create/get-email');
    await this.page.type("#email", 'tessa.ting@foo-bar.gov.uk');
    await this.page.waitForSelector('#submit');
    await this.page.click('#submit')
    await this.goToPath('/create/check-email');
    await this.page.type("#otp", '43553');
    await this.page.click('#submit')
    await this.goToPath('/create/update-password');
    await this.page.type("#password", 'strongPassword');
    await this.page.type("#confirmPassword", 'strongPassword');
    await this.page.click('#submit');
    await this.goToPath('/create/enter-mobile');
    await this.page.type("#mobile-number", '+447998708769');
    await this.page.click('#submit');
    await this.page.waitForSelector('#otp');    
    await this.page.type("#otp", '43553');
    await this.page.click('#resend-code-page')
    await this.goToPath('/create/resend-phone-code');
    await this.page.click('#slack-channel');
  });

  When('they select the ‘Resend security code’ button', async function () {
    await this.goToPath('/create/get-email');
    await this.page.type("#email", 'tessa.ting@foo-bar.gov.uk');
    await this.page.waitForSelector('#submit');
    await this.page.click('#submit')
    await this.goToPath('/create/check-email');
    await this.page.type("#otp", '43553');
    await this.page.click('#submit')
    await this.goToPath('/create/update-password');
    await this.page.type("#password", 'strongPassword');
    await this.page.type("#confirmPassword", 'strongPassword');
    await this.page.click('#submit');
    await this.goToPath('/create/enter-mobile');
    await this.page.type("#mobile-number", '+447998708769');
    await this.page.click('#submit');
    await this.page.waitForSelector('#otp');    
    await this.page.type("#otp", '43553');
    await this.page.click('#resend-code-page')
    await this.goToPath('/create/resend-phone-code');
    await this.page.click('#submit');
  });