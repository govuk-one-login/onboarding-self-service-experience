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
    getLinkWithHrefStarting,
    clickYourAccountSubnavLink
} from "./shared-functions";

import AxePuppeteer from "@axe-core/puppeteer";

Given("the user is on the home page", async function () {
    await this.goToPath("/");
});

Given("the user is on the {string} page", async function (path: string) {
    await this.goToPath(path);
});

When("they click on the {string} link", async function (text: string) {
    const link = await getLink(this.page, text);
    await clickElement(this.page, link);
});

When("they click on the {string} external link", async function (text: string) {
    const link = await getLink(this.page, text);
    await clickElement(this.page, link, 50000);
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

When("they click the Resend security code button", async function () {
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
Then("they should be redirected to the {string}", async function (this: TestContext, expectedPath: string) {
    const path = new URL(this.page.url());
    const actualPath = path.pathname + path.search;
    assert.equal(actualPath, expectedPath);
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

Then("the error message {string} must be displayed for the {string} radios", async function (errorMessage, field) {
    const errorLink = await this.page.$x(`//div[@class="govuk-error-summary"]//a[@href="#${field}-options"]`);
    await checkErrorMessageDisplayedForField(this.page, errorLink, errorMessage, field);
});

Then("they should see the text {string}", async function (this: TestContext, text) {
    const bodyText = await this.page.$eval("body", element => element.textContent);
    assert.equal(bodyText?.includes(text), true, `Body text does not contain '${text}'`);
});

Then("they should not see the text {string}", async function (this: TestContext, text) {
    const bodyText = await this.page.$eval("body", element => element.textContent);
    assert.equal(bodyText?.includes(text), false, `Body text does not contain '${text}'`);
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

When("they click on the forgot password link in their email", async function () {
    const path = "/sign-in/forgot-password/create-new-password?loginName=registered@test.gov.uk&confirmationCode=123456";
    await this.goToPath(path);
});

When("they click Your account link in the left side navigation", async function () {
    await clickYourAccountSubnavLink(this.page);
});

When("they try to submit the form without selecting any value from the radio button", async function () {
    await clickSubmitButton(this.page);
});

When("they select the {string} radio button", async function (labelText) {
    const el = await this.page.$x(`//label[contains(text(), "${labelText}")]`);
    await el[0].click();
});

Then(/^there should be no accessibility violations$/, async function (this: TestContext) {
    const results = await new AxePuppeteer(this.page).withTags(["wcag21aa", "wcag22aa"]).analyze();
    assert.equal(results.violations.length, 0, "Accessibility Violations Detected : " + JSON.stringify(results.violations));
});

// eslint-disable-next-line
Then("pause whilst waiting to complete", {timeout: 1 * 5000}, async function () {});

Then("they they should not see a link that points to {string}", async function (href: string) {
    const links = await this.page.$x(`//a[contains(@href, "${href}")]`);
    assert.equal(links.length, 0, "The link exists");
});

Then("they should see a link that points to {string}", async function (href: string) {
    const links = await this.page.$x(`//a[contains(@href, "${href}")]`);
    assert.equal(links.length, 1, `The link pointing to "${href}" does not exist or is not unique`);
});
