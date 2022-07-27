import {Given, When, Then} from "@cucumber/cucumber";
import {strict as assert} from "assert";
import {getLink, checkUrl} from './shared-functions';

Given('that the user is on the {string} page', async function (route: string) {
    await this.goToPath(route);
});

When('they click on the {string} link', async function (text: string) {
    let links = await this.page.$x(`//a[contains(., '${text}')]`);
    await Promise.all([
        this.page.waitForNavigation({timeout: 10000}),
        links[0].click()
    ]);
});

When('they click on the {string} button-link', async function (text: string) {
    let links = await this.page.$x(`//a[contains(., '${text}') and contains(concat(" ", normalize-space(@class), " "), " govuk-button ")]`);
    await Promise.all([
        this.page.waitForNavigation({timeout: 10000}),
        links[0].click()
    ]);
});

When('they select the Submit button', async function () {
    await Promise.all([
        this.page.waitForNavigation(),
        this.page.click("#submit")
    ]);
});

Then('they should be directed to the following page: {string}', async function (path) {
    const expectedUrl = new URL(path, this.host);
    assert.equal(this.page.url(), expectedUrl.href);
});

Then('they should be directed to the following URL: {string}', async function (url) {
    assert.equal(this.page.url(), url);
});

Then('they should be directed to a page with the title {string}', async function (title: string) {
    let actualTitle = await this.page.title();
    assert.equal(actualTitle, title, `Page title was ${actualTitle}`);
});

Then('their data is saved in the spreadsheet', async function () {
    // we can't check the sheet but if we're on the right page and can find some content then that's good enough
});

Then('the error message {string} must be displayed for the {string} field', async function (errorMessage, field) {
    const errorLink = await this.page.$x(`//div[contains(concat(" ", normalize-space(@class), " "), " govuk-error-summary ")]//a[@href="#${field}"]`);
    await checkErrorMessageDisplayedAboveElement(this.page, errorLink, errorMessage, field);
});

Then('the error message {string} must be displayed for the {string} radios', async function (errorMessage, field) {
    const errorLink = await this.page.$x(`//div[contains(concat(" ", normalize-space(@class), " "), " govuk-error-summary ")]//a[@href="#${field}-error"]`);
    await checkErrorMessageDisplayedAboveElement(this.page, errorLink, errorMessage, field);
});

Then('they should see the text {string}', async function (text) {
    let bodyText: string = await this.page.$eval('body', (element: any) => element.textContent)
    assert.equal(bodyText.includes(text), true, `Body text does not contain "${text}"`)
});

Then('the {string} link will point to the following URL: {string}', async function (linkText, expectedUrl) {
    let link = await getLink(this.page, linkText);
    await checkUrl(this.page, link, expectedUrl);
});

Then('the {string} link will point to the following page: {string}', async function (linkText, expectedPage) {
    let link = await getLink(this.page, linkText);
    await checkUrl(this.page, link, expectedPage);
});

async function checkErrorMessageDisplayedAboveElement(page: Page, errorLink: any, errorMessage: string, field: string) {
    assert.notEqual(errorLink.length, 0, `Expected to find the message ${errorMessage} in the error summary.`);

    const actualMessageInSummary = await page.evaluate((el: { textContent: any; }) => el.textContent, errorLink[0]);
    assert.equal(actualMessageInSummary, errorMessage, `Expected text of the link to be ${errorMessage}`);

    const messageAboveElement = await page.$x(`//span[contains(concat(" ", normalize-space(@class), " "), " govuk-error-message ") and @id="${field}-error" ]`);
    assert.notEqual(messageAboveElement.length, 0, `Expected to find the message ${errorMessage} above the ${field} field.`);

    const actualMessageAboveSummary = await page.evaluate((el: { textContent: any; }) => el.textContent, messageAboveElement[0]);
    assert.equal(actualMessageAboveSummary.trim(), "Error: " + errorMessage, `Expected the message above the ${field} field to be ${errorMessage}`);
}
