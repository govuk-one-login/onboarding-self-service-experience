import {After, AfterAll, Before, BeforeAll, setWorldConstructor, setDefaultTimeout} from "@cucumber/cucumber";
import {IWorldOptions} from "@cucumber/cucumber/lib/support_code_library_builder/world";
import puppeteer, {Browser, Page} from "puppeteer";
import {enterTextIntoTextInput, clickSubmitButton} from "./steps/shared-functions";
import Chance from "chance";
import fse from "fs-extra";

// eslint-disable-next-line @typescript-eslint/no-var-requires
const {World} = require("@cucumber/cucumber");

const chance = new Chance.Chance();

export const timeout = 30000;
setDefaultTimeout(timeout);

let browser: Browser, counter: number;
const uuid = chance.guid();

const username = `testuser.${uuid}@digital.cabinet-office.gov.uk`;
const servicename = `testservice_${uuid}`;
const password = `valid_${chance.string({length: 20})}`;
const email_otp_code = "123456";
const mobile_number = "07700900000";
const sms_otp_code = "789012";

export class TestContext extends World {
    private browserPage: Page | undefined;

    // Track the current state of the user credentials.
    private _username: string = username;
    private _password: string = password;
    private _mobile: string = mobile_number;
    private _otp_code: string = sms_otp_code;
    private _servicename: string = servicename;

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

    get username(): string {
        return this._username;
    }

    set username(username: string) {
        this._username = username;
    }

    get password(): string {
        return this._password;
    }

    set password(password: string) {
        this._password = password;
    }

    get mobile(): string {
        return this._mobile;
    }

    set mobile(mobile: string) {
        this._mobile = mobile;
    }

    get otp_code(): string {
        return this._otp_code;
    }

    set otp_code(otp_code: string) {
        this._otp_code = otp_code;
    }

    get servicename(): string {
        return this._servicename;
    }

    set servicename(servicename: string) {
        this._servicename = servicename;
    }
}

BeforeAll({timeout: 60 * 1000}, async function () {
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

    const host = process.env.HOST ?? "http://localhost:3000";
    console.log(`Running tests against ${host}`);
    browser = await puppeteer.launch({
        headless: !process.env.SHOW_BROWSER,
        args: ["--no-sandbox"]
    });
    console.log("Puppeteer launched...");
    const page = await browser.newPage();
    console.log("New page tab opened...");

    await page.goto(`${host}/register`);

    console.log("Navigated to registration page...");
    await enterTextIntoTextInput(page, username, "emailAddress");
    await clickSubmitButton(page);
    console.log("Entered email address.");
    await enterTextIntoTextInput(page, email_otp_code, "securityCode");
    await clickSubmitButton(page);
    console.log("Entered email otp code.");
    await enterTextIntoTextInput(page, password, "password");
    await clickSubmitButton(page);
    console.log("Entered password.");
    await enterTextIntoTextInput(page, mobile_number, "mobileNumber");
    await clickSubmitButton(page);
    console.log("Entered mobile number.");
    await enterTextIntoTextInput(page, sms_otp_code, "securityCode");
    await clickSubmitButton(page);
    console.log("Entered otp security code.");
    await enterTextIntoTextInput(page, servicename, "serviceName");
    await clickSubmitButton(page, 60000);
    console.log("Completed user registration.");
});

Before(async function (this: TestContext) {
    this.host = process.env.HOST ?? "http://localhost:3000";
    this.page = await browser.newPage();

    // Record the state for the test run.
    console.log(`Starting test with context: username='${this.username}' servicename='${this.servicename}'`);
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
