import {ElementHandle, Page} from "puppeteer";
import {getElement} from "./elements";
import {XPathFunction, XPathQuery} from "./xpath";

const defaultTimeout = 5000;

export async function clickToNavigate(page: Page, element: ElementHandle | XPathQuery, timeout = defaultTimeout) {
    if (element instanceof XPathQuery) element = await element.getElement(page);
    await Promise.all([page.waitForNavigation({timeout: timeout}), element.click()]);
}

export async function clickSubmitButton(page: Page, timeout?: number) {
    return clickToNavigate(page, await getElement(page, "submit", "button"), timeout);
}

export async function clickContinueButton(page: Page, timeout?: number) {
    const continueButton = await getContinueButton(page);
    return continueButton ? clickToNavigate(page, continueButton, timeout) : clickSubmitButton(page, timeout);
}

export async function clickSideNavigationItem(page: Page, item: string) {
    await clickToNavigate(
        page,
        XPathQuery.create(
            ["nav", {attribute: "class", function: XPathFunction.contains, value: "side-navigation"}],
            ["li", {attribute: "class", value: "side-navigation__item"}],
            ["a", item]
        )
    );
}

export async function clickLinkThatOpensInNewTab(page: Page, link: XPathQuery<"a">, timeout = defaultTimeout): Promise<Page> {
    const newTab = page.browser().waitForTarget(target => target.opener() === page.target(), {timeout: timeout});
    const linkElement = await link.getElement(page);
    await Promise.all([newTab, linkElement.click()]);

    const newPage = await newTab.then(tab => tab.page());
    if (!newPage) throw new Error("Could not open link in a new tab");

    await newPage.reload({timeout: timeout});
    return newPage;
}

async function getContinueButton(page: Page) {
    const buttons = await XPathQuery.create([
        "a",
        {function: XPathFunction.contains, value: "Continue"},
        {attribute: "role", value: "button"},
        {attribute: "class", value: "govuk-button"}
    ]).getAll(page);

    if (buttons.length == 1) {
        return buttons[0];
    }
}
