import {When} from "@cucumber/cucumber";
import {button} from "../helpers/elements";
import {enterTextIntoField, getFieldId, submitFieldValue} from "../helpers/inputs";

When("they submit the {} {string}", async function (fieldName, value) {
    await submitFieldValue(this.page, fieldName, value);
});

When("they enter the {} {string}", async function (fieldName, value) {
    await enterTextIntoField(this.page, fieldName, value);
});

When("they enter {string} into the {} field", async function (value, fieldName) {
    await enterTextIntoField(this.page, fieldName, value);
});

When("they submit a correct security code", async function () {
    await submitFieldValue(this.page, "security code", "123456");
});

When("they submit a valid mobile phone number", async function () {
    await submitFieldValue(this.page, "mobile phone number", "07700 900123");
});

When("they submit a valid password", async function () {
    await submitFieldValue(this.page, "password", "this-is-not-a-common-password");
});

When("they click the {string} {} toggle", async function (text, fieldName) {
    const toggle = await button(text, "gem-c-show-password__toggle", getFieldId(fieldName)).getElement(this.page);
    await toggle.click();
});
