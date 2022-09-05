import {strict as assert} from "assert";
import {ElementHandle, Page} from "puppeteer";

const DEFAULT_TIMEOUT = 5000;

export async function getLink(page: Page, linkText: string): Promise<ElementHandle> {
    const links = await page.$x(`//a[contains(., '${linkText}')]`);
    return getSingleLink(links, linkText);
}

export async function getLinkWithHref(page: Page, href: string): Promise<ElementHandle> {
    const links = await page.$x(`//a[contains(@href, '${href}')]`);
    return getSingleLink(links, href);
}

export async function getButtonLink(page: Page, linkText: string): Promise<any> {
    const links = await page.$x(
        `//a[contains(., '${linkText}') and contains(concat(" ", normalize-space(@class), " "), " govuk-button ")]`
    );
    return getSingleLink(links, linkText);
}

export async function clickLink(page: Page, link: ElementHandle, timeout = DEFAULT_TIMEOUT): Promise<any> {
    await Promise.all([page.waitForNavigation({timeout: timeout}), link.click()]);
}

export async function clickSubmitButton(page: Page, timeout = DEFAULT_TIMEOUT): Promise<any> {
    await clickButtonWithId(page, "submit", timeout);
}

export async function clickButtonWithId(page: Page, id: string, timeout = DEFAULT_TIMEOUT): Promise<any> {
    await Promise.all([page.waitForNavigation({timeout: timeout}), page.click(`#${id}`)]);
}

export async function checkUrl(page: Page, link: ElementHandle, expectedUrl: string): Promise<void> {
    assert.equal(await page.evaluate((anchor: {getAttribute: (arg0: string) => any}) => anchor.getAttribute("href"), link), expectedUrl);
}

function getSingleLink(links: ElementHandle[], match: string): ElementHandle {
    assert.equal(links.length, 1, `Not exactly one link matched ${match} (matches: ${links.length})`);
    return links[0];
}

export async function enterTextIntoTextInput(page: Page, text: string, inputId: string): Promise<any> {
    const inputElement = await page.$(`#${inputId}`);
    if (!inputElement) {
        throw new Error(`Could not find element with id ${inputId}`);
    }

    await inputElement.click({clickCount: 3});
    await inputElement.press("Backspace");
    await page.type(`#${inputId}`, text);
}
