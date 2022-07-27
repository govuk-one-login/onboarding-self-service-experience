import { strict as assert } from 'assert';
import { ElementHandle, Page } from 'puppeteer';

export async function getLink(page: Page, linkText: string): Promise<any> {
    let links = await page.$x(`//a[contains(., '${linkText}')]`);
    assert.equal(links.length, 1, `More than one link matched ${linkText}`);
    return links
}

export async function checkUrl(page: Page, links: ElementHandle[], expectedUrl: string): Promise<void> {
    assert.equal(await page.evaluate((anchor: { getAttribute: (arg0: string) => any; }) => anchor.getAttribute('href'), links[0]), expectedUrl);
}
