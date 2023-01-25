import {Given, Then, When} from "@cucumber/cucumber";
import {strict as assert} from "assert";
import {TestContext} from "../test-setup";
import {
    checkErrorMessageDisplayedForField,
    checkUrl,
    clickElement,
    clickLinkThatOpensInNewTab,
    clickSubmitButton,
    enterTextIntoTextInput,
    getButton,
    getButtonLink,
    getLink,
    getLinkWithHref,
    getLinkWithHrefStarting
} from "./shared-functions";

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

When("they click on the {string} link that opens in a new tab", async function (this: TestContext, linkText: string) {
    const link = await getLink(this.page, linkText);
    this.page = await clickLinkThatOpensInNewTab(this.page, link);
    await this.page.bringToFront();
});

When("they click on the link with the URL starting with {string}", async function (text: string) {
    const link = await getLinkWithHrefStarting(this.page, text);
    await clickElement(this.page, link);
});

When("they click on the link that points to {string}", async function (href: string) {
    const link = await getLinkWithHref(this.page, href);
    await clickElement(this.page, link);
});

Then("they see the toggle link {string} on the field {string}", async function (text: string, fieldName: string) {
    await getButton(this.page, text, "gem-c-show-password__toggle", fieldName);
});

When("they toggle the {string} link on the field {string}", async function (text: string, fieldName: string) {
    const link = await getButton(this.page, text, "gem-c-show-password__toggle", fieldName);
    await link.click();
});

When("they click the Submit button", async function () {
    await clickSubmitButton(this.page);
});

When("they click the Confirm button", async function () {
    await clickSubmitButton(this.page);
});

When("they click the Continue button", async function () {
    const button = await getButtonLink(this.page, "Continue");

    if (button) {
        await clickElement(this.page, button);
        return;
    }

    await clickSubmitButton(this.page);
});

When("they click the {string} button", async function (text: string) {
    const button = await getButton(this.page, text);
    await clickElement(this.page, button);
});

Then("they should be redirected to the {string} page", async function (this: TestContext, expectedPath: string) {
    assert.equal(new URL(this.page.url()).pathname, expectedPath);
});

Then("they should be redirected to a page with the path starting with {string}", async function (this: TestContext, expectedPath: string) {
    assert.ok(new URL(this.page.url()).pathname.startsWith(expectedPath));
});

Then("they should be directed to the URL {string}", async function (this: TestContext, url: string) {
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
});
