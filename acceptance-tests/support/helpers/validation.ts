import {strict as assert} from "assert";
import {Page} from "puppeteer";
import {FieldName, getFieldAttribute, getFieldId} from "./inputs";
import {XPathQuery} from "./xpath";

export async function checkPasswordValueHidden(page: Page, fieldName: FieldName, shouldBeHidden = true) {
    assert.equal(await getFieldAttribute(page, fieldName, "type"), shouldBeHidden ? "password" : "text");
}

export async function checkErrorMessageDisplayedForField(page: Page, fieldName: FieldName, errorMessage: string) {
    const fieldId = getFieldId(fieldName);

    const messageInSummary = await XPathQuery.create(
        ["div", {attribute: "class", value: "govuk-error-summary"}],
        ["a", {attribute: "href", value: `#${fieldId}`}]
    ).getAttribute(page, "textContent");

    assert.equal(messageInSummary, errorMessage, `Expected the text of the error link for the '${fieldId}' field to be '${errorMessage}'`);

    const messageAboveElement = await XPathQuery.create([
        "p",
        {attribute: "class", value: "govuk-error-message"},
        {attribute: "id", value: `${fieldId}-error`}
    ]).getAttribute(page, "textContent");

    assert.equal(
        messageAboveElement?.trim(),
        "Error: " + errorMessage,
        `Expected the message above the '${fieldId}' field to be '${errorMessage}'`
    );
}
