import {After, AfterAll, Before, BeforeAll} from "@cucumber/cucumber";
import {IWorldOptions} from "@cucumber/cucumber/lib/support_code_library_builder/world";
import {Browser} from "puppeteer";

const puppeteer = require("puppeteer");
const {setWorldConstructor, World} = require("@cucumber/cucumber");

let browser: Browser;

class TestContext extends World {
    constructor(options: IWorldOptions) {
        super(options);
    }

    async goToPath(path: string) {
        await this.page.goto(new URL(path, this.host).toString());
    }
}

BeforeAll(async function () {
    console.log(`Running tests against ${process.env.HOST || "local"}`);
    const SHOW_BROWSER = !process.env.SHOW_BROWSER;
    browser = await puppeteer.launch({headless: SHOW_BROWSER});
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
