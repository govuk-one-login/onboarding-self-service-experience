import checkAuthorisation from "../../src/middleware/authoriser.js";
import {request, response} from "../mocks.js";

const mockNext = vi.fn();
const mockRes = response();

describe("Verify access token in the session", () => {
    beforeEach(() => {
        vi.clearAllMocks();
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
