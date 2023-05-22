import {ElementFor, EvaluateFunc, FlattenHandle, HandleFor, Page} from "puppeteer";

export type HTMLTag = keyof HTMLElementTagNameMap;
export type HTMLElementHandle<Tag extends HTMLTag> = HandleFor<ElementFor<Tag>>;
export type XPathExpressionStepPredicate = {value: string; attribute?: string; function?: XPathFunction} | string;
export type XPathExpressionStep<Tag extends HTMLTag = HTMLTag> = [Tag, ...XPathExpressionStepPredicate[]];
export type XPathExpressionFor<Tag extends HTMLTag = HTMLTag> = [...XPathExpressionStep[], XPathExpressionStep<Tag>];

export const enum XPathFunction {
    contains = "contains",
    startsWith = "starts-with"
}

export class XPathQuery<Tag extends HTMLTag = HTMLTag> {
    private readonly steps: string[] = [];
    private readonly tag: Tag;

    static create<Tag extends HTMLTag>(...steps: XPathExpressionFor<Tag>) {
        return new XPathQuery<Tag>(steps);
    }

    private constructor(steps: XPathExpressionStep[]) {
        steps.forEach(node => this.addStep(node));
        const [tag] = steps.slice(-1)[0];
        this.tag = tag as Tag;
    }

    async getAll(page: Page): Promise<HTMLElementHandle<Tag>[]> {
        const elements = await page.$x(this.query());
        return Promise.all(elements.map(element => element.toElement(this.tag)));
    }

    async evaluate<Func extends EvaluateFunc<[HTMLElementHandle<Tag>]>>(page: Page, func: Func) {
        return page.evaluate(func, await this.getElement(page));
    }

    async getAttribute<Attribute extends keyof FlattenHandle<HandleFor<ElementFor<Tag>>>>(page: Page, attribute: Attribute) {
        return this.evaluate(page, element => element[attribute]);
    }

    async getElement(page: Page): Promise<HTMLElementHandle<Tag>> {
        const elements = await this.getAll(page);
        if (elements.length !== 1) throw new Error(`Expected one element to match query '${this.query()}' but got ${elements.length})`);
        return elements[0];
    }

    private query() {
        return this.steps.join("");
    }

    private addStep(step: XPathExpressionStep) {
        const [tag, ...predicates] = step;
        this.steps.push(`//${tag}${predicates.map(predicate => this.buildPredicate(predicate)).join("")}`);
    }

    private buildPredicate(predicate: XPathExpressionStepPredicate) {
        let value, attributeName, func;

        if (typeof predicate === "string") {
            value = predicate;
        } else {
            ({value, attribute: attributeName, function: func} = predicate);
        }

        const attribute = attributeName ? `@${attributeName}` : "text()";
        const expression = func ? `${func}(${attribute}, "${value}")` : `${attribute}="${value}"`;
        return `[${expression}]`;
    }
}
