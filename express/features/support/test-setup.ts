import {Browser} from "puppeteer";
import {After, AfterAll, Before, BeforeAll} from "@cucumber/cucumber";
import {IWorldOptions} from "@cucumber/cucumber/lib/support_code_library_builder/world";

const puppeteer = require('puppeteer');
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
    console.log(`Running tests against ${process.env.HOST || "local"}`)
    browser = await puppeteer.launch({headless: true});
})

Before(async function () {
    this.host = process.env.HOST as string || 'http://localhost:3000';
    this.page = await browser.newPage();
})

After(async function () {
    await this.page.close();
})

AfterAll(async function () {
    await browser.close();
})

setWorldConstructor(TestContext);
