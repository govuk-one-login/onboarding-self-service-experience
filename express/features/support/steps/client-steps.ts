import {Given, Then, When} from "@cucumber/cucumber";
import {clickSubmitButton, enterTextIntoTextInput} from "./shared-functions";
import {strict as assert} from "assert";
import {TestContext} from "../test-setup";

const VALID_PUBLIC_KEY =
    "-----BEGIN PUBLIC KEY-----\n" +
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzub4UEORDbGXh36oJCG+\n" +
    "dD7PQpkiiyaCy8tn0mgB8GXgRyRjGRG4Xh0jU4mteNhFHyWxrdClZ7we7kqR025P\n" +
    "ltXBorHgzZq6sHcUHyKKlQquLCEv1P0PuZ30P7uERf7xtkWMN2/s4hsG0It7/Wt0\n" +
    "2o8uJAE1oWNbSN+a5d6nXLvfkgruGidNLtUnEAP7HR0hz9P4zNgp3hOgkaEX299S\n" +
    "vS6Twgr/tzjAygi1AWE8hPImn0LBwHHjcXqSL39pk3YKOG0Na2ZY/FdlbTQP5iRU\n" +
    "6CIY/e++fMVF1aignXW8rJN1xEiLhxAS4PLqpzXzZ6k5JW/rJiGC0KIKPcJ6xazx\n" +
    "QQIDAQAB\n" +
    "-----END PUBLIC KEY-----\n";

const VALID_PUBLIC_KEY_WITH_JUNK =
    "-----BEGIN PUBLIC KEY-----\n" +
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzub4UEORDbGXh36oJCG+\n" +
    "dD7PQpkiiyaCy8tn0mgB8GXgRyRjGRG4Xh0jU4mteNhFHyWxrdClZ7we7kqR025P\n" +
    "ltXBorHgzZq6sHcUHyKKlQquLCEv1P0PuZ30P7uERf7xtkWMN2/s4hsG0It7/Wt0\n" +
    "2o8uJAE1oWNbSN+a5d6nXLvfkgruGidNLtUnEAP7HR0hz9P4zNgp3hOgkaEX299S\n" +
    "vS6Twgr/tzjAygi1AWE8hPImn0LBwHHjcXqSL39pk3YKOG0Na2ZY/FdlbTQP5iRU\n" +
    "6CIY/e++fMVF1aignXW8rJN1xEiLhxAS4PLqpzXzZ6k5JW/rJiGC0KIKPcJ6xazx\n" +
    "QQIDAQAB\n" +
    "-----END PUBLIC KEY-----\n" +
    "the crypto lib never reads this but we don't want it appended to the end of the auth compliant key";

const VALID_PUBLIC_KEY_WITHOUT_HEADERS =
    "MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzub4UEORDbGXh36oJCG+\n" +
    "dD7PQpkiiyaCy8tn0mgB8GXgRyRjGRG4Xh0jU4mteNhFHyWxrdClZ7we7kqR025P\n" +
    "ltXBorHgzZq6sHcUHyKKlQquLCEv1P0PuZ30P7uERf7xtkWMN2/s4hsG0It7/Wt0\n" +
    "2o8uJAE1oWNbSN+a5d6nXLvfkgruGidNLtUnEAP7HR0hz9P4zNgp3hOgkaEX299S\n" +
    "vS6Twgr/tzjAygi1AWE8hPImn0LBwHHjcXqSL39pk3YKOG0Na2ZY/FdlbTQP5iRU\n" +
    "6CIY/e++fMVF1aignXW8rJN1xEiLhxAS4PLqpzXzZ6k5JW/rJiGC0KIKPcJ6xazx\n" +
    "QQIDAQAB";

Given("the user submits a valid public key with headers", async function () {
    await enterTextIntoTextInput(this.page, VALID_PUBLIC_KEY, "serviceUserPublicKey");
    await clickSubmitButton(this.page);
});

Given("the user submits a valid public key with headers and junk after the key", async function () {
    await enterTextIntoTextInput(this.page, VALID_PUBLIC_KEY_WITH_JUNK, "serviceUserPublicKey");
    await clickSubmitButton(this.page);
});

Given("the user submits a valid public key without headers", async function () {
    await enterTextIntoTextInput(this.page, VALID_PUBLIC_KEY_WITHOUT_HEADERS, "serviceUserPublicKey");
    await clickSubmitButton(this.page);
});

Then("they should see the public key they just entered in an inset text component", async function (this: TestContext) {
    const publicKeySpan = await this.page.$("p#current-public-key");
    const publicKey = await this.page.evaluate(element => element.textContent, publicKeySpan);
    assert.equal(publicKey.replace(/\n/g, "").trim(), VALID_PUBLIC_KEY_WITHOUT_HEADERS.replace(/\n/g, ""));
});

Then("they should only see the first 24 characters of the public key for their service", async function (this: TestContext) {
    const keyContainerContent: string = await this.page.$eval("#publicKeyShort", element => element.textContent);
    assert.equal(keyContainerContent.length, 28);
});

When("they click 'email' checkbox", async function () {
    const emailCheckboxInput = await this.page.$("#userAttributes");
    if (!emailCheckboxInput) {
        throw new Error(`Could not find element with id userAttributes`);
    }
    await emailCheckboxInput.click();
});

Then("the attribute with the name 'email' is displayed in the 'User attributes required' field", async function (this: TestContext) {
    const attributeContainerContent: string = await this.page.$eval("#userAttributesContainer", element => element.textContent);
    assert.equal(attributeContainerContent, "openid, email");
});

Then("the updated user attribute with name 'email' should not be displayed", async function (this: TestContext) {
    const attributeContainerContent: string = await this.page.$eval("#userAttributesContainer", element => element.textContent);
    assert.equal(attributeContainerContent, "openid");
});

Given("the 'email' user attribute is not selected", async function (this: TestContext) {
    const attributeContainerContent: string = await this.page.$eval("#userAttributesContainer", element => element.textContent);
    assert.notEqual(attributeContainerContent, "openid, email");
});

Given("only one attribute with the name 'openid' is displayed in the 'User attributes required' field", async function (this: TestContext) {
    const attributeContainerContent: string = await this.page.$eval("#userAttributesContainer", element => element.textContent);
    assert.equal(attributeContainerContent, "openid");
});
