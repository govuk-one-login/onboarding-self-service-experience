import checkAuthorisation from "../../src/middleware/authoriser";
import {request, response} from "../mocks";

const next = jest.fn();
const req = request();
const res = response();

describe("Verify access token in the session", () => {
    it("Redirect to the session timeout page if there is no access token", async () => {
        await checkAuthorisation(req, res, next);

        // For 'resume-before-password' and 'resume-after-password' Authorisation is re-instigated following re-entry of
        // required authoristation codes on Pages (i.e. EMail Code or Password) and therefore checking can be bypassed here.
        if (req.path !== "/resume-before-password" && req.path !== "/resume-after-password" && req.method === "POST") {
            expect(next).not.toHaveBeenCalled();
            expect(res.redirect).toHaveBeenCalledWith("/session-timeout");
        }
    });
});
