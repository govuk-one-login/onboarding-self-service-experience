import checkAuthorisation from "../../src/middleware/authoriser";
import {request, response} from "../mocks";

const mockNext = jest.fn();
const mockRes = response();

describe("Verify access token in the session", () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it("Redirect to the session timeout page if there is no access token", async () => {
        const mockReq = request({
            path: "/test-path"
        });
        await checkAuthorisation(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.redirect).toHaveBeenCalledWith("/session-timeout");
    });
});
