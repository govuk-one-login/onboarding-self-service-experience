import {ElementHandle, Page} from "puppeteer";
import {HTMLElementHandle, HTMLTag, XPathExpressionStepPredicate, XPathFunction, XPathQuery} from "./xpath";

export function getElement(page: Page, id: string): Promise<ElementHandle>;
export function getElement<Tag extends HTMLTag>(page: Page, id: string, tag: Tag): Promise<HTMLElementHandle<Tag>>;
export function getElement<Tag extends HTMLTag>(page: Page, query: XPathQuery<Tag>): Promise<HTMLElementHandle<Tag>>;
export function getElement<Tag extends HTMLTag>(page: Page, query: XPathQuery<Tag> | string, tag?: Tag) {
    return query instanceof XPathQuery ? query.getElement(page) : getElementBySelector(page, query, tag);
}

export function link(linkText: string): XPathQuery<"a"> {
    return XPathQuery.create(["a", {function: XPathFunction.contains, value: linkText}]);
}

export function linkWithHref(href: string): XPathQuery<"a"> {
    return XPathQuery.create(["a", {attribute: "href", function: XPathFunction.contains, value: href}]);
}

export function linkWithHrefStarting(hrefStart: string): XPathQuery<"a"> {
    return XPathQuery.create(["a", {attribute: "href", function: XPathFunction.startsWith, value: hrefStart}]);
}

export function button(text: string, buttonClass?: string, linkedFieldId?: string): XPathQuery<"button"> {
    const predicates: XPathExpressionStepPredicate[] = [{function: XPathFunction.contains, value: text}];
    buttonClass && predicates.push({attribute: "class", value: buttonClass});
    linkedFieldId && predicates.push({attribute: "aria-controls", value: linkedFieldId});
    return XPathQuery.create(["button", ...predicates]);
}

async function getElementBySelector<Tag extends HTMLTag>(page: Page, id: string, tag?: Tag) {
    const selector = `${tag ?? ""}${id ? `#${id}` : ""}`;
    const element = await page.$(selector);
    if (!element) throw new Error(`Could not find an element matching selector '${selector}'`);
    return tag ? element.toElement(tag) : element;
}
