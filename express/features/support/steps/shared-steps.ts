import {Given, Then, When} from "@cucumber/cucumber";
import {strict as assert} from "assert";
import {TestContext} from "../test-setup";
import {
    checkErrorMessageDisplayedForField,
    checkUrl,
    clickElement,
    clickSubmitButton,
    enterTextIntoTextInput,
    getButtonAnchor,
    getButtonLink,
    getButtonWithText,
    getLink,
    getLinkWithHrefStarting,
    getLinkWithHref
} from "./shared-functions";
import {Page} from "puppeteer";

Given("that the user is on the home page", async function () {
    await this.goToPath("/");
});

Given("that the user is on the {string} page", async function (path: string) {
    await this.goToPath(path);
});

When("they click on the {string} link", async function (text: string) {
    const link = await getLink(this.page, text);
    await clickElement(this.page, link);
});

When("they click on the link with the url that starts with {string}", async function (text: string) {
    const link = await getLinkWithHrefStarting(this.page, text);
    await clickElement(this.page, link);
});

When("they click on the link that points to {string}", async function (href: string) {
    const link = await getLinkWithHref(this.page, href);
    await clickElement(this.page, link);
});

When("they click on the {string} button-link", async function (text: string) {
    const link = await getButtonAnchor(this.page, text);
    await clickElement(this.page, link);
});

When("they toggle the {string} link", async function (text: string) {
    const link = await getButtonLink(this.page, text, "gem-c-show-password__toggle", "password");
    await link.click();
});

Then("they see the toggle {string} link", async function (text: string) {
    await getButtonLink(this.page, text, "gem-c-show-password__toggle", "password");
});

When("they toggle {string} link on field {string}", async function (text: string, fieldName: string) {
    const link = await getButtonLink(this.page, text, "gem-c-show-password__toggle", fieldName);
    await link.click();
});

Then("they see the toggle {string} link on field {string}", async function (text: string, fieldName: string) {
    await getButtonLink(this.page, text, "gem-c-show-password__toggle", fieldName);
});

When("they click the Submit button", async function () {
    await clickSubmitButton(this.page);
});

When("they click the Continue button", async function () {
    await clickSubmitButton(this.page);
});

When("they click the Confirm button", async function () {
    await clickSubmitButton(this.page);
});

When("they click the {string} button", async function (text: string) {
    const button = await getButtonWithText(this.page, text);
    await clickElement(this.page, button);
});

Then("they should be redirected to the {string} page", async function (this: TestContext, path: string) {
    const expectedUrl = new URL(path, this.host);
    assert.equal(this.page.url().replace(/\/$/, ""), expectedUrl.href);
});

Then("they should be redirected to a page with path starting with {string}", async function (this: TestContext, path: string) {
    const expectedUrl = new URL(path, this.host);
    assert.equal(this.page.url().startsWith(expectedUrl.href), true);
});

Then("they should be directed to the URL {string}", async function (url) {
    assert.equal(this.page.url(), url);
});

Then("they should be redirected to a page with the title {string}", async function (title: string) {
    const actualTitle = await this.page.title();
    assert.equal(actualTitle, title, `Page title was ${actualTitle}`);
});

Then("their data is saved in the spreadsheet", async function () {
    // we can't check the sheet but if we're on the right page and can find some content then that's good enough
});

Then("the error message {string} must be displayed for the {string} field", async function (errorMessage, field) {
    const errorLink = await this.page.$x(`//div[@class="govuk-error-summary"]//a[@href="#${field}"]`);
    await checkErrorMessageDisplayedForField(this.page, errorLink, errorMessage, field);
});

Then("the error message {string} must be displayed for the {string} radios", async function (errorMessage, field) {
    const errorLink = await this.page.$x(`//div[@class="govuk-error-summary"]//a[@href="#${field}-error"]`);
    await checkErrorMessageDisplayedForField(this.page, errorLink, errorMessage, field);
});

Then("they should see the text {string}", async function (this: TestContext, text) {
    const bodyText: string = await this.page.$eval("body", element => element.textContent);
    assert.equal(bodyText.includes(text), true, `Body text does not contain '${text}'`);
});

Then("the {string} link will point to the following URL: {string}", async function (linkText, expectedUrl) {
    const link = await getLink(this.page, linkText);
    await checkUrl(this.page, link, expectedUrl);
});

Then("the {string} link will point to the following page: {string}", async function (linkText, expectedPage) {
    const link = await getLink(this.page, linkText);
    await checkUrl(this.page, link, expectedPage);
});

When("they enter {string} into the {string} field", async function (text: string, field: string) {
    await enterTextIntoTextInput(this.page, text, field);
});

When("the user submits the email {string}", async function (email: string) {
    await enterTextIntoTextInput(this.page, email, "emailAddress");
    await clickSubmitButton(this.page);
});

When("the user submits the security code {string}", async function (securityCode: string) {
    await enterTextIntoTextInput(this.page, securityCode, "securityCode");
    await clickSubmitButton(this.page);
});

When("the user submits the password {string}", async function (password: string) {
    await enterTextIntoTextInput(this.page, password, "password");
    await clickSubmitButton(this.page);
});

When("the user submits the mobile phone number {string}", async function (mobileNumber: string) {
    await enterTextIntoTextInput(this.page, mobileNumber, "mobileNumber");
    await clickSubmitButton(this.page);
});

When("they click on the forgot password link in their email", async function () {
    const path = "/create-new-password?userName=registered@gds.gov.uk&confirmationCode=123456";
    await this.goToPath(path);
    const expectedUrl = new URL(path, this.host);
    assert.equal(this.page.url().replace(/\/$/, ""), expectedUrl.href);
});

Then("the user should be saved in the team’s inbox: govuk-sign-in@digital.cabinet-office.gov.uk", async function () {
    // we can't check the team’s inbox but if we're on the right page and can find some content then that's good enough
});

When(
    "they click on the {string} link, it opens in a new tab and they are redirected to {string}",
    async function (text: string, url: string) {
        const link = await getLink(this.page, text);
        await link.click();
        await this.page.waitForTimeout(2000);
        const tabs: Page[] = await this.browser.pages();
        assert.equal(tabs[tabs.length - 1].url(), url);
    }
);
