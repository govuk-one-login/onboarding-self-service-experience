import {request, response} from "../mocks.js";
import {signOut} from "../../src/controllers/session.js";

describe("signOut controller tests", () => {
    it("calls destroy and redirects to /", () => {
        const mockReq = request({
            session: {
                destroy: vi.fn().mockImplementation(callback => callback())
            }
        });
        const mockRes = response();
        signOut(mockReq, mockRes, vi.fn());
        expect(mockRes.redirect).toHaveBeenCalledWith("/");
    });
});
