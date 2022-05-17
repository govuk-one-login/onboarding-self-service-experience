import { Console } from "console";

const chaiExpect = require("chai").expect;
const chaiAssert = require("chai").assert;
const errorResponse = require('../../src/middleware/emailValidator').errorResponse;
const checkEmailDomain = require('../../src/middleware/emailValidator').checkEmailDomain;
const rfc822EmailValidator = require('../../src/middleware/rfc822-validate/validator').rfc822EmailValidator;

describe('Check Email Domain', () => {
    it('should return true for allowed domains : fake@email.gov.uk', async () => {
        await checkEmailDomain("fake@email.gov.uk").then((data: boolean) => {
            chaiExpect(data).to.equal(true)
            console.log("valid domain check success")
        }).catch((err: Error) => {
            console.log("THE ERROR ", err);
            chaiAssert.fail(err);
        });
    })

    it('should return false if domain not alllowed : fake@email.co.uk', async () => {
        await checkEmailDomain("fake@email.co.uk").then((data: boolean) => {
            chaiExpect(data).to.equal(false)
            console.log("invalid domain check success")
        }).catch((err: Error) => {
            console.log("THE ERROR ", err);
            chaiAssert.fail(err);
        });
    })
});

describe('RFC822 Email Validator', () => {
    it('should return true for valid email :fake@email.gov.uk', async () => {
        const result = await rfc822EmailValidator("fake@email.gov.uk")
        if (!result) {
            chaiAssert.fail("valid format check failed");
        }
        chaiExpect(result).to.equal(true)
        console.log("valid format check success")
    })

    it('should return false for invalid email : fake||||email.gov.uk', async () => {
        const result = await rfc822EmailValidator("fake||||email.gov.uk")
        if (result) {
            chaiAssert.fail("invalid format check failed");
        }
        chaiExpect(result).to.equal(false)
        console.log("invalid format check success")
    })
});

describe('Error Response', () => {
    it('should render a page with given error messages', async () => {
        const emailAddress = "fake@email.gov.uk";
        const res = {
            render: (view: string, data: any) => {
                chaiExpect(view).to.equal('create-account/get-email.njk')
                chaiExpect(data.errorMessages.get("emailAddress")).to.equal('Please check that your email is formatted correctly.');
                chaiExpect(data.values.get('emailAddress')).to.equal(emailAddress)
                chaiExpect(data.fieldOrder).to.deep.equal(['emailAddress'])
            }
        };
        await errorResponse(emailAddress, res, 'emailAddress', 'Please check that your email is formatted correctly.');
    });
});
