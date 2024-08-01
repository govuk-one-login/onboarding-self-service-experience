import {Given, Then} from "@cucumber/cucumber";
import {clickSubmitButton, enterTextIntoTextInput} from "./shared-functions";
import {strict as assert} from "assert";
import {TestContext} from "../test-setup";

const publicKey = `
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAzub4UEORDbGXh36oJCG+
dD7PQpkiiyaCy8tn0mgB8GXgRyRjGRG4Xh0jU4mteNhFHyWxrdClZ7we7kqR025P
ltXBorHgzZq6sHcUHyKKlQquLCEv1P0PuZ30P7uERf7xtkWMN2/s4hsG0It7/Wt0
2o8uJAE1oWNbSN+a5d6nXLvfkgruGidNLtUnEAP7HR0hz9P4zNgp3hOgkaEX299S
vS6Twgr/tzjAygi1AWE8hPImn0LBwHHjcXqSL39pk3YKOG0Na2ZY/FdlbTQP5iRU
6CIY/e++fMVF1aignXW8rJN1xEiLhxAS4PLqpzXzZ6k5JW/rJiGC0KIKPcJ6xazx
QQIDAQAB
`.trim();

const publicKeyWithHeaders = `
-----BEGIN PUBLIC KEY-----
${publicKey}
-----END PUBLIC KEY-----
`.trim();

const publicKeyWithExtraText = `
this text before the begin line is not a part of the key
${publicKeyWithHeaders}
this text after the end line is not a part of the public key;
`.trim();

const publicKey2 = `
MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQCxkqfYJp2cqfmFB63DkqI6AC8m
pjiZj6tN54SVKHVAOJ5EBiz9tsFfv7f5C8Ck4LPvbYbrqeNwBMRzi6eki5Jsn2LM
i4xPt3HFvs5aMmCSAa22rDpoo2R2bSLkpWXRa91VfrIC1Q2GzepW4VfHS+SV5wQK
RtlswrYQW59AfWQcdQIDAQAB
`.trim();

const badPublicKey = `Ib3DQEBAQUAA4GNAD`.trim();

const blankPublicKey = ``.trim();
const badUrl = "invalidurl";
const jwksUrl = "https://www.example.com/";
const jwksUrl2 = "https://www.example2.com/";

const keys = {
    "without headers": publicKey,
    "with headers": publicKeyWithHeaders,
    "with extra text": publicKeyWithExtraText,
    "with different value": publicKey2,
    "with bad value": badPublicKey,
    "with blank value": blankPublicKey,
    "with valid url": jwksUrl,
    "with different url": jwksUrl2,
    "with bad url": badUrl
};

Given("they submit a jwks url {string}", async function (keyValue) {
    await enterTextIntoTextInput(this.page, keys[keyValue as keyof typeof keys], "jwksUrl");
    await clickSubmitButton(this.page);
});

Given("they submit a public key {}", async function (keyValue) {
    await enterTextIntoTextInput(this.page, keys[keyValue as keyof typeof keys], "serviceUserPublicKey");
    await clickSubmitButton(this.page);
});

Given("the public key has not been added yet by the user", async function (this: TestContext) {
    const keyContainerContent = await this.page.$eval("#publicKeyContainer", element => element.textContent);
    assert.equal(keyContainerContent?.trim(), "Not added yet");
});

Then("they are able see their public key {string}", async function (this: TestContext, keyValue) {
    const keyContainerContent = await this.page.$eval("#publicKeyLong", element => element.textContent);
    const elementVisibility = await this.page.$eval("#publicKeyLong", element => element.checkVisibility());
    assert.equal(elementVisibility, true);
    assert.equal(keyContainerContent, keys[keyValue as keyof typeof keys].replace(/\n/g, ""));
});

Then("their public key is prefilled {string}", async function (this: TestContext, keyValue) {
    const keyContainerContent = await this.page.$eval("#serviceUserPublicKey", element => element.textContent);
    const elementVisibility = await this.page.$eval("#serviceUserPublicKey", element => element.checkVisibility());
    assert.equal(elementVisibility, true);
    assert.equal(keyContainerContent, keys[keyValue as keyof typeof keys].replace(/\n/g, ""));
});

Then("they are able see their jwks url {string}", async function (this: TestContext, keyValue) {
    const keyContainerContent = await this.page.$eval("#publicKeyLong", element => element.textContent);
    const elementVisibility = await this.page.$eval("#publicKeyLong", element => element.checkVisibility());
    assert.equal(elementVisibility, true);
    assert.equal(keyContainerContent, keys[keyValue as keyof typeof keys].replace(/\n/g, ""));
});

Then("their jwks url is prefilled {string}", async function (this: TestContext, keyValue) {
    const keyContainerContent = await this.page.$eval("#jwksUrl", element => element.getAttribute("value"));
    const elementVisibility = await this.page.$eval("#jwksUrl", element => element.checkVisibility());
    assert.equal(elementVisibility, true);
    assert.equal(keyContainerContent, keys[keyValue as keyof typeof keys].replace(/\n/g, ""));
});
