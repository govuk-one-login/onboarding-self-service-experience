import {After, AfterAll, Before, BeforeAll} from "@cucumber/cucumber";
import {IWorldOptions} from "@cucumber/cucumber/lib/support_code_library_builder/world";
import puppeteer, {Browser, Page} from "puppeteer";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {setWorldConstructor, World} = require("@cucumber/cucumber");

let browser: Browser;

export class TestContext extends World {
    private browserPage: Page | undefined;

    constructor(options: IWorldOptions) {
        super(options);
    }

    async goToPath(path: string) {
        await this.page?.goto(new URL(path, this.host).toString());
    }

    get page(): Page {
        if (this.browserPage == undefined) {
            throw new Error("Browser page is not present");
        }

        return this.browserPage;
    }

    set page(page: Page) {
        this.browserPage = page;
    }
}

BeforeAll(async function () {
    console.log(`Running tests against ${process.env.HOST || "local"}`);
    browser = await puppeteer.launch({headless: !process.env.SHOW_BROWSER});
});

Before(async function () {
    this.host = (process.env.HOST as string) || "http://localhost:3000";
    this.page = await browser.newPage();
});

After(async function () {
    if (!process.env.SHOW_BROWSER) {
        await this.page.close();
    }
});

AfterAll(async function () {
    if (!process.env.SHOW_BROWSER) {
        await browser.close();
    }
});

setWorldConstructor(TestContext);
