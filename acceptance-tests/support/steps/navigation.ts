import {Given, When} from "@cucumber/cucumber";
import {button, link, linkWithHref, linkWithHrefStarting} from "../helpers/elements";
import {
    clickToNavigate,
    clickLinkThatOpensInNewTab,
    clickSubmitButton,
    clickContinueButton,
    clickSideNavigationItem
} from "../helpers/navigation";
import {TestContext} from "../test-setup";

Given("the user is on the {string} page", async function (this: TestContext, path: string) {
    await this.goToPath(path);
});

Given("the user is on the home page", async function (this: TestContext) {
    await this.goToPath("/");
});

When("they click on the forgot password link in their email", async function (this: TestContext) {
    await this.goToPath("/sign-in/forgot-password/create-new-password?loginName=registered@gds.gov.uk&confirmationCode=123456");
});

When("they click on the {string} link", async function (text: string) {
    await clickToNavigate(this.page, link(text));
});

When("they click on the {string} external link", async function (text: string) {
    await clickToNavigate(this.page, link(text), 50000);
});

When("they click on the {string} link that opens in a new tab", async function (this: TestContext, linkText: string) {
    this.page = await clickLinkThatOpensInNewTab(this.page, link(linkText));
    await this.page.bringToFront();
});

When("they click on the link with the URL starting with {string}", async function (text: string) {
    await clickToNavigate(this.page, linkWithHrefStarting(text));
});

When("they click on the link that points to {string}", async function (href: string) {
    await clickToNavigate(this.page, linkWithHref(href));
});

When("they click the Submit button", async function () {
    await clickSubmitButton(this.page);
});

When("they click the Confirm button", async function () {
    await clickSubmitButton(this.page);
});

When("they click the Continue button", async function () {
    await clickContinueButton(this.page);
});

When("they click the {string} button", async function (text: string) {
    await clickToNavigate(this.page, button(text));
});

When("they click {string} in side navigation", async function (item) {
    await clickSideNavigationItem(this.page, item);
});
