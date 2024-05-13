import {request, response} from "../mocks";
import {signOut} from "../../src/controllers/session";

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
