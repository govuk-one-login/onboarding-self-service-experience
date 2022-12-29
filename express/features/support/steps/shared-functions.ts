import {strict as assert} from "assert";
import {ElementHandle, Page} from "puppeteer";

const defaultTimeout = 5000;

export async function getLink(page: Page, linkText: string): Promise<ElementHandle> {
    const links = await page.$x(`//a[contains(text(), "${linkText}")]`);
    return getSingleElement(links, linkText);
}

export async function getLinkWithHref(page: Page, href: string): Promise<ElementHandle> {
    const links = await page.$x(`//a[contains(@href, "${href}")]`);
    return getSingleElement(links, href);
}

export async function getLinkWithHrefStarting(page: Page, hrefStarting: string): Promise<ElementHandle> {
    const links = await page.$x(`//a[starts-with(@href, "${hrefStarting}")]`);
    return getSingleElement(links, hrefStarting);
}

export async function getButtonWithText(page: Page, buttonText: string): Promise<ElementHandle> {
    const buttons = await page.$x(`//button[contains(text(), '${buttonText}')]`);
    return getSingleElement(buttons, buttonText);
}

export async function getButtonLink(page: Page, linkText: string): Promise<ElementHandle> {
    const links = await page.$x(`//a[contains(text(), "${linkText}")][@class="govuk-button"]`);
    return getSingleElement(links, linkText);
}

export async function clickElement(page: Page, element: ElementHandle, timeout = defaultTimeout) {
    await Promise.all([page.waitForNavigation({timeout: timeout}), element.click()]);
}

export async function clickSubmitButton(page: Page, timeout = defaultTimeout) {
    await clickButtonWithId(page, "submit", timeout);
}

export async function clickButtonWithId(page: Page, id: string, timeout = defaultTimeout) {
    await Promise.all([page.waitForNavigation({timeout: timeout}), page.click(`#${id}`)]);
}

export async function checkUrl(page: Page, link: ElementHandle, expectedUrl: string) {
    const actualUrl = await page.evaluate(element => element.getAttribute("href"), link);
    assert.equal(actualUrl, expectedUrl);
}

function getSingleElement(elements: ElementHandle[], match: string): ElementHandle {
    assert.equal(elements.length, 1, `Not exactly one element matched ${match} (matches: ${elements.length})`);
    return elements[0];
}

export async function enterTextIntoTextInput(page: Page, text: string, inputId: string) {
    const inputElement = await page.$(`#${inputId}`);
    if (!inputElement) {
        throw new Error(`Could not find element with id ${inputId}`);
    }

    await inputElement.click({clickCount: 3});
    await inputElement.press("Backspace");
    await page.type(`#${inputId}`, text);
}

export async function checkErrorMessageDisplayedForField(page: Page, errorLink: ElementHandle[], errorMessage: string, field: string) {
    assert.notEqual(errorLink.length, 0, `Expected to find the message ${errorMessage} in the error summary.`);

    const messageInSummary = await page.evaluate(element => element.textContent, errorLink[0]);
    assert.equal(messageInSummary, errorMessage, `Expected text of the link to be ${errorMessage}`);

    const messagesAboveElement = await page.$x(`//p[@class="govuk-error-message"][@id="${field}-error"]`);
    assert.notEqual(messagesAboveElement.length, 0, `Expected to find the message ${errorMessage} above the ${field} field.`);

    const messageAboveElement = await page.evaluate(element => element.textContent, messagesAboveElement[0]);
    assert.equal(
        messageAboveElement.trim(),
        "Error: " + errorMessage,
        `Expected the message above the ${field} field to be ${errorMessage}`
    );
}
