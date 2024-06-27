import {After, AfterAll, Before, BeforeAll, setWorldConstructor} from "@cucumber/cucumber";
import {IWorldOptions} from "@cucumber/cucumber/lib/support_code_library_builder/world";
import puppeteer, {Browser, Page} from "puppeteer";
import {enterTextIntoTextInput, clickSubmitButton} from "./steps/shared-functions";
import Chance from 'chance';
import fse from "fs-extra";
import { v4 as uuidv4 } from 'uuid';

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {World} = require("@cucumber/cucumber");

let browser: Browser, counter: number;
const chance = new Chance.Chance();
const uuid = uuidv4();
export const username = `testuser.${uuid}@digital.cabinet-office.gov.uk`;
export const servicename = `testservice_${uuid}`;
export const password = chance.string({ length: 8 });
export const email_otp_code = "123456";
export const mobile_number = "07700900000";
export const sms_otp_code = "789012";

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
    const screenshotsDir = "reports/screenshots";
    if (fse.pathExistsSync(screenshotsDir)) {
        console.log("Clear screenshots directory ...");
        fse.removeSync(screenshotsDir);
        // recreate directory
        fse.ensureDirSync(screenshotsDir);
    } else {
        fse.ensureDirSync(screenshotsDir);
    }

    const host = process.env.HOST ?? "http://localhost:3000"
    console.log(`Running tests against ${host}`);
    browser = await puppeteer.launch({
        timeout: 5000,
        headless: !process.env.SHOW_BROWSER,
        args: ["--no-sandbox"]
    });

    let page = await browser.newPage();

    await page.goto(`${host}/register/enter-email-address`);
    await enterTextIntoTextInput(page, username, "emailAddress");
    await clickSubmitButton(page);
    await enterTextIntoTextInput(page, email_otp_code, "securityCode");
    await clickSubmitButton(page);
    await enterTextIntoTextInput(page, password, "password");
    await clickSubmitButton(page);
    await enterTextIntoTextInput(page, mobile_number, "mobileNumber");
    await clickSubmitButton(page);
    await enterTextIntoTextInput(page, sms_otp_code, "securityCode");
    await clickSubmitButton(page);
    await enterTextIntoTextInput(page, servicename, "serviceName");
    await clickSubmitButton(page);
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
        const screenshotsDir = "reports/screenshots";
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
