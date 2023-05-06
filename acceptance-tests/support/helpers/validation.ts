import {strict as assert} from "assert";
import {Page} from "puppeteer";
import {FieldName, getFieldElement, getFieldId} from "./inputs";
import {XPathQuery} from "./xpath";

export async function checkPasswordValueHidden(page: Page, fieldName: FieldName, shouldBeHidden = true) {
    const passwordField = await getFieldElement(page, fieldName);
    const fieldType = await passwordField.evaluate(field => field.type);
    assert.equal(fieldType, shouldBeHidden ? "password" : "text");
}

export async function checkErrorMessageDisplayedForField(page: Page, fieldName: FieldName, errorMessage: string) {
    const fieldId = getFieldId(fieldName);

    const messageInSummary = await XPathQuery.create(
        ["div", {attribute: "class", value: "govuk-error-summary"}],
        ["a", {attribute: "href", value: `#${fieldId}`}]
    ).evaluate(page, element => element.textContent);

    assert.equal(messageInSummary, errorMessage, `Expected the text of the error link for the '${fieldId}' field to be '${errorMessage}'`);

    const messageAboveElement = await XPathQuery.create([
        "p",
        {attribute: "class", value: "govuk-error-message"},
        {attribute: "id", value: `${fieldId}-error`}
    ]).evaluate(page, element => element.textContent);

    assert.equal(
        messageAboveElement?.trim(),
        "Error: " + errorMessage,
        `Expected the message above the '${fieldId}' field to be '${errorMessage}'`
    );
}
