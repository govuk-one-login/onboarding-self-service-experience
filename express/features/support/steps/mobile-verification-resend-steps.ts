
   
import {Given} from "@cucumber/cucumber";

Given('that the user is on the `Check your phone` page', async function () {
  await this.goToPath('/create/get-email');
  await this.page.type("#email", 'registering-successfully@gds.gov.uk');
  await this.page.waitForSelector('#submit');
  await this.page.click('#submit');
  await this.page.waitForSelector('#create-email-otp');    
  await this.page.type("#create-email-otp", '435553');
  await this.page.click('#submit')
  await this.page.waitForSelector('#password');    
  await this.page.type("#password", 'strongPassword');
  await this.page.type("#confirmPassword", 'strongPassword');
  await this.page.click('#submit');
  await this.page.waitForSelector('#mobile-number');    
  await this.page.type("#mobile-number", '+447998708769');
  await this.page.click('#submit');
  await this.page.waitForSelector('#resend-code-page');    
});

