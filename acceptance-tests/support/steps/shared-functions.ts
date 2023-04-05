import {strict as assert} from "assert";
import {ElementHandle, Page} from "puppeteer";

const defaultTimeout = 5000;

export async function getLink(page: Page, linkText: string): Promise<ElementHandle> {
    const links = await page.$x(`//a[contains(text(), "${linkText}")]`);
    return getSingleElement(links, "a", linkText);
}

export async function getLinkWithHref(page: Page, href: string): Promise<ElementHandle> {
    const links = await page.$x(`//a[contains(@href, "${href}")]`);
    return getSingleElement(links, "a", href);
}

export async function getLinkWithHrefStarting(page: Page, hrefStarting: string): Promise<ElementHandle> {
    const links = await page.$x(`//a[starts-with(@href, "${hrefStarting}")]`);
    return getSingleElement(links, "a", hrefStarting);
}

export async function getButton(page: Page, buttonText: string, buttonClass?: string, linkedFieldName?: string): Promise<ElementHandle> {
    const classSelector = buttonClass ? `[@class="${buttonClass}"]` : "";
    const ariaSelector = linkedFieldName ? `[@aria-controls="${linkedFieldName}"]` : "";
    const buttons = await page.$x(`//button[contains(text(), "${buttonText}")]${classSelector}${ariaSelector}`);
    return getSingleElement(buttons, "button", buttonText);
}

export async function getButtonLink(page: Page, buttonText: string): Promise<ElementHandle | undefined> {
    const buttons = await page.$x(`//a[contains(text(), "${buttonText}")][@role="button"][@class="govuk-button"]`);

    if (buttons.length == 1) {
        return buttons[0].toElement("a");
    }
}

export async function clickElement(page: Page, element: ElementHandle, timeout = defaultTimeout) {
    await Promise.all([page.waitForNavigation({timeout: timeout}), element.click()]);
}

export async function clickLinkThatOpensInNewTab(page: Page, link: ElementHandle, timeout = defaultTimeout): Promise<Page> {
    const newTab = page.browser().waitForTarget(target => target.opener() === page.target(), {timeout: timeout});
    await Promise.all([newTab, link.click()]);

    const newPage: Page | null = await newTab.then(tab => tab.page());
    if (newPage === null) {
        throw new Error("Could not open link in a new tab");
    }

    await newPage.reload({timeout: timeout});
    return newPage;
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
        messageAboveElement?.trim(),
        "Error: " + errorMessage,
        `Expected the message above the ${field} field to be ${errorMessage}`
    );
}

function getSingleElement(elements: ElementHandle<Node>[], tagName: keyof HTMLElementTagNameMap, match: string): Promise<ElementHandle> {
    assert.equal(elements.length, 1, `Not exactly one element matched ${match} (matches: ${elements.length})`);
    return elements[0].toElement(tagName);
}
