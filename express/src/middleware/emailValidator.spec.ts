const chaiAssert = require("chai").assert;
const errorResponse = require('../../src/middleware/emailValidator').errorResponse;
const isAllowedDomain = require('../../src/middleware/emailValidator').isAllowedDomain;
const rfc822EmailValidator = require('../../src/middleware/rfc822-validate/validator').rfc822EmailValidator;

describe('Check Email Domain', () => {
    it('should return true for allowed domains : fake@email.gov.uk', async () => {
        await isAllowedDomain("fake@email.gov.uk").then((data: boolean) => {chaiAssert.equal(data, true , "valid domain check success" )})
    })

    it('should return false if domain not allowed : fake@email.co.uk', async () => {
        await isAllowedDomain("fake@email.co.uk").then((data: boolean) => {chaiAssert.equal(data, false , "invalid domain check success" )})
    })
});

describe('RFC822 Email Validator', () => {
    it('should return true for valid email :fake@email.gov.uk', async () => {
        chaiAssert.equal(rfc822EmailValidator("fake@email.gov.uk"), true , "valid email check success" )
    })

    it('should return false for invalid email : fake||||email.gov.uk', async () => {
        chaiAssert.equal(rfc822EmailValidator("fake||||email.gov.uk"), false , "invalid email check success" )
    })
});

describe('Error Response', () => {
    it('should render a page with given error messages', async () => {
        const emailAddress = "fake@email.gov.uk";
        const res = {
            render: (view: string, data: any) => {
                chaiAssert.equal(data.errorMessages.get("emailAddress"), "Please check that your email is formatted correctly.", "error message check success")
                chaiAssert.equal(data.values.get("emailAddress"), emailAddress, "email address check success")
                chaiAssert.equal(data.fieldOrder[0], "emailAddress", "field order check success")   
                chaiAssert.equal(view, "create-account/get-email.njk", "view check success")
            }
        };
        await errorResponse(emailAddress, res, 'emailAddress', 'Please check that your email is formatted correctly.');
    });
});
