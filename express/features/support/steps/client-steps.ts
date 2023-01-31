import {Given, Then} from "@cucumber/cucumber";
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

Given("the user submits a valid public key without headers", async function () {
    await enterTextIntoTextInput(this.page, VALID_PUBLIC_KEY_WITHOUT_HEADERS, "serviceUserPublicKey");
    await clickSubmitButton(this.page);
});

Then("they should see the public key they just entered in an inset text component", async function (this: TestContext) {
    const publicKeySpan = await this.page.$("p#current-public-key");
    const publicKey = await this.page.evaluate(element => element.textContent, publicKeySpan);
    assert.equal(publicKey.replace(/\n/g, "").trim(), VALID_PUBLIC_KEY_WITHOUT_HEADERS.replace(/\n/g, ""));
});
