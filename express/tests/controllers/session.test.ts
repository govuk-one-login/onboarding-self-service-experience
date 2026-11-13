import {request, response} from "../mocks.js";
import {signOut} from "../../src/controllers/session.js";

describe("signOut controller tests", () => {
    it("calls destroy and redirects to /", () => {
        const mockReq = request({
            session: {
                destroy: jest.fn().mockImplementation(callback => callback())
            }
        });
        const mockRes = response();
        signOut(mockReq, mockRes, jest.fn());
        expect(mockRes.redirect).toHaveBeenCalledWith("/");
    });
});
