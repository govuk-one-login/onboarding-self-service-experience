import { strict as assert } from 'assert';
import { ElementHandle, Page } from 'puppeteer';

const DEFAULT_TIMEOUT = 5000;

export async function getLink(page: Page, linkText: string): Promise<any> {
    let links = await page.$x(`//a[contains(., '${linkText}')]`);
    return getSingleLink(links, linkText);
}

export async function getButtonLink(page: Page, linkText: string): Promise<any> {
    let links = await page.$x(`//a[contains(., '${linkText}') and contains(concat(" ", normalize-space(@class), " "), " govuk-button ")]`);
    return getSingleLink(links, linkText);
}

export async function clickLink(page: Page, link: ElementHandle, timeout = DEFAULT_TIMEOUT): Promise<any> {
    await Promise.all([
        page.waitForNavigation({ timeout: timeout }),
        link.click()
    ]);
}

export async function clickSubmitButton(page: Page, timeout = DEFAULT_TIMEOUT): Promise<any> {
    await Promise.all([
        page.waitForNavigation({ timeout: timeout }),
        page.click('#submit')
    ]);
}

export async function checkUrl(page: Page, link: ElementHandle, expectedUrl: string): Promise<void> {
    assert.equal(await page.evaluate((anchor: { getAttribute: (arg0: string) => any; }) => anchor.getAttribute('href'), link), expectedUrl);
}

function getSingleLink(links: ElementHandle[], linkText: string): ElementHandle {
    assert.equal(links.length, 1, `More than one link matched ${linkText}`);
    return links[0];
}
