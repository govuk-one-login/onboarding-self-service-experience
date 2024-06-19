import {After, AfterAll, Before, BeforeAll, setWorldConstructor} from "@cucumber/cucumber";
import {IWorldOptions} from "@cucumber/cucumber/lib/support_code_library_builder/world";
import puppeteer, {Browser, Page} from "puppeteer";
import fse from "fs-extra";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const {World} = require("@cucumber/cucumber");

let browser: Browser, counter: number;

export class TestContext extends World {
    private browserPage: Page | undefined;

    constructor(options: IWorldOptions) {
        super(options);
    }

    async goToPath(path: string) {
        await this.page?.goto(new URL(path, this.host).toString());
    }

    get page(): Page {
        if (!this.browserPage) {
            throw new Error("Browser page is not present");
        }

        return this.browserPage;
    }

    set page(page: Page) {
        this.browserPage = page;
    }
}

BeforeAll(async function () {
    counter = 0;
    const screenshotsDir = `${process.env.TEST_REPORT_ABSOLUTE_DIR ?? "reports"}/screenshots`;
    if (fse.pathExistsSync(screenshotsDir)) {
        console.log("Clear screenshots directory ...");
        fse.removeSync(screenshotsDir);
        // recreate directory
        fse.ensureDirSync(screenshotsDir);
    } else {
        fse.ensureDirSync(screenshotsDir);
    }
    console.log(`Running tests against ${process.env.HOST ?? "local"}`);
    browser = await puppeteer.launch({headless: !process.env.SHOW_BROWSER});
    browser = await puppeteer.launch({
        timeout: 5000,
        headless: !process.env.SHOW_BROWSER,
        args: ["--no-sandbox"]
    });
});

Before(async function (this: TestContext) {
    this.host = process.env.HOST ?? "http://localhost:3000";
    this.page = await browser.newPage();
});

After(async function (this: TestContext, scenario) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    const result = scenario.result.status;
    const name = scenario.pickle.name.replace(/ /g, "-");
    if (result === "FAILED") {
        counter++;
        const screenshotsDir = `${process.env.TEST_REPORT_ABSOLUTE_DIR ?? "reports"}/screenshots`;
        const stream = await this.page.screenshot({
            path: `${screenshotsDir}/${counter}-${result}-[${name}].jpeg`,
            fullPage: true
        });
        return this.attach(stream, "image/jpeg");
    }
});

AfterAll(async function () {
    if (!process.env.SHOW_BROWSER) {
        await browser.close();
    }
});

setWorldConstructor(TestContext);
