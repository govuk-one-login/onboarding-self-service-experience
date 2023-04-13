import checkAuthorisation from "middleware/authoriser";
import {request, response} from "../mocks";

const next = jest.fn();
const req = request();
const res = response();

describe("Verify access token in the session", () => {
    it("Redirect to the session timeout page if there is no access token", async () => {
        await checkAuthorisation(req, res, next);

        expect(next).not.toHaveBeenCalled();
        expect(res.redirect).toHaveBeenCalledWith("/session-timeout");
    });
});
