import {Then} from "@cucumber/cucumber";
import {strict as assert} from "assert";
import {getFieldValue} from "../helpers/inputs";
import {checkErrorMessageDisplayedForField, checkPasswordValueHidden} from "../helpers/validation";
import {XPathQuery} from "../helpers/xpath";
import {TestContext} from "../test-setup";

Then("the {} field is empty", async function (fieldName) {
    const value = await getFieldValue(this.page, fieldName);
    assert.equal(value, "");
});

Then("the {} field should have the value {string}", async function (fieldName, fieldValue) {
    const value = await getFieldValue(this.page, fieldName);
    assert.equal(fieldValue, value);
});

Then("the {} field should contain the value {string}", async function (fieldName, fieldValue) {
    const value = await getFieldValue(this.page, fieldName);
    assert.match(value, RegExp(fieldValue));
});

Then("the {} field value is hidden", async function (fieldName) {
    await checkPasswordValueHidden(this.page, fieldName, true);
});

Then("the {} field value is shown", async function (fieldName) {
    await checkPasswordValueHidden(this.page, fieldName, false);
});

Then("the error message {string} should be displayed for the {} field", async function (errorMessage, fieldName) {
    await checkErrorMessageDisplayedForField(this.page, fieldName, errorMessage);
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

Then("they should see the text {string}", async function (this: TestContext, text) {
    const bodyText = await XPathQuery.create(["body"]).evaluate(this.page, element => element.textContent);
    assert.equal(bodyText?.includes(text), true, `Body text does not contain '${text}'`);
});
