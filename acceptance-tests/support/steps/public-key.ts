import {Given, Then} from "@cucumber/cucumber";
import {strict as assert} from "assert";
import {getElement} from "../helpers/elements";
import {submitFieldValue} from "../helpers/inputs";
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

Given("they submit a valid public key with headers", async function () {
    await submitFieldValue(this.page, "public key", publicKeyWithHeaders, "textarea");
});

Given("they submit a valid public key with extra text", async function () {
    await submitFieldValue(this.page, "public key", publicKeyWithExtraText, "textarea");
});

Given("they submit a valid public key without headers", async function () {
    await submitFieldValue(this.page, "public key", publicKey, "textarea");
});

Then("they should see the public key they just entered", async function (this: TestContext) {
    const publicKeyElement = await getElement(this.page, "current-public-key");
    const publicKey = await publicKeyElement.evaluate(element => element.textContent);
    assert.equal(publicKey?.replace(/\n/g, "").trim(), publicKey?.replace(/\n/g, ""));
});
