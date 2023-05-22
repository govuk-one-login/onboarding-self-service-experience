import {ElementFor, ElementHandle, FlattenHandle, HandleFor, NodeFor, Page} from "puppeteer";
import {HTMLElementHandle, HTMLTag, XPathExpressionStepPredicate, XPathFunction, XPathQuery} from "./xpath";

export function getElement(page: Page, id: string): Promise<HandleFor<Element>>;
export function getElement<Tag extends HTMLTag>(page: Page, id: string, tag?: Tag): Promise<HTMLElementHandle<Tag>>;
export function getElement<Tag extends HTMLTag>(page: Page, query: XPathQuery<Tag>): Promise<HTMLElementHandle<Tag>>;
export function getElement<Tag extends HTMLTag>(page: Page, query: XPathQuery<Tag> | string, tag?: Tag) {
    const el = getElementBySel(page, "hello", "a");
    const ela = getElementBySel(page, "hello");
    return query instanceof XPathQuery ? query.getElement(page) : getElementBySelector(page, query, tag);
}

type HTMLElementType = HTMLTag | undefined;
// type HTMLElementFor<Type extends HTMLElementType> = Type extends HTMLTag ? HandleFor<ElementFor<NonNullable<Type>>> : ElementHandle;
type HTMLElementFor<Type extends HTMLElementType> = Type extends HTMLTag ? ElementFor<NonNullable<Type>> : Element;

type Simple = HTMLTag | undefined;
type Select<S extends Simple> = S extends HTMLTag ? S : number;

type ST = Select<"a">;
type SS = Select<undefined>;

type DefTag = HTMLElementFor<"a">;
type DefDef = HTMLElementFor<undefined>;

export function getEl<Tag extends HTMLElementType>(page: Page, id: string, tag?: Tag) {
    return getElementBySel(page, id, tag);
}

async function getElementBySel<Tag extends HTMLElementType = undefined, Type extends Element = HTMLElementFor<Tag>>(
    page: Page,
    id: string,
    tag: Tag
): Promise<ElementHandle<Type>> {
    const selector = getSelector(id, tag);
    const element = await page.$(selector);
    if (!element) throw new Error(`Could not find an element matching selector '${selector}'`);

    if (tag) {
        const t = tag;
        return element.toElement(t);
    }

    return element;

    // return tag ? element.toElement(tag) : element;
}

type TagToString<Tag extends HTMLTag> = `${Tag}`;
type TestNode<Tag extends HTMLTag> = NodeFor<TagToString<Tag>>;

const ts = "a";
type TTT = TagToString<typeof ts>;
// type TestA = NodeFor<TagToString<typeof t>>;

const t = test("div");
const hello = "hello";

function test<Tag extends HTMLTag>(tag?: Tag): NodeFor<Tag> {
    let n: NodeFor<Tag>;
    const hello = "a";
    type Test = NodeFor<typeof hello>;
}

export function getElementAttribute(page: Page, id: string, attribute: keyof Element): Promise<Element[typeof attribute]>;
export function getElementAttribute<Tag extends HTMLTag, Attribute extends keyof ElementFor<Tag>>(
    page: Page,
    id: string,
    attribute: Attribute,
    tag?: Tag
): Promise<ElementFor<Tag>[Attribute]>;
export async function getElementAttribute<Tag extends HTMLTag, Attribute extends keyof NodeFor<Tag>>(
    page: Page,
    id: string,
    attribute: Attribute,
    tag: Tag
) {
    const selector = getSelector(id, tag);
    const sel = getSell("a");
    await page.$eval(sel, el => el.rel);
    return page.$eval(tag, element => element[attribute]);
}

function getSell<Tag extends HTMLTag>(tag: Tag): `${Tag}#hello` {
    return `${tag}#hello`;
}

function getSel<Tag extends HTMLTag, Ret extends string = TagToString<Tag>>(tag: Tag): TagToString<typeof tag> {
    return tag.toString();
}

function getSelll(id: string, tag?: HTMLTag) {
    return `${tag ?? ""}${id ? `#${id}` : ""}`;
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
    const selector = getSelector(id, tag);
    const element = await page.$(selector);
    if (!element) throw new Error(`Could not find an element matching selector '${selector}'`);
    return tag ? element.toElement(tag) : element;
}

function getSelector(id: string, tag?: HTMLTag) {
    return `${tag ?? ""}${id ? `#${id}` : ""}`;
}
