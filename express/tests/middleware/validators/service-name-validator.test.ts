import validateServiceName from "../../../src/middleware/validators/service-name-validator";
import {TEST_TEMPLATE_PATH} from "../../constants";
import {request, response} from "../../mocks";

describe("validateServiceName middleware tests", () => {
    it.each(["", "     "])("renders the provided template path with an error message when the service name is '%s'", serviceName => {
        const mockReq = request({
            body: {
                serviceName
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        const testServiceNameValidation = validateServiceName(TEST_TEMPLATE_PATH);
        testServiceNameValidation(mockReq, mockRes, mockNext);

        expect(mockNext).not.toHaveBeenCalled();
        expect(mockRes.render).toHaveBeenCalledWith(TEST_TEMPLATE_PATH, {
            errorMessages: {
                serviceName: "Enter your service name"
            }
        });
    });
    it("calls next for a valid service name", () => {
        const mockReq = request({
            body: {
                serviceName: "someServiceName"
            }
        });
        const mockRes = response();
        const mockNext = jest.fn();

        const testServiceNameValidation = validateServiceName(TEST_TEMPLATE_PATH);
        testServiceNameValidation(mockReq, mockRes, mockNext);

        expect(mockNext).toHaveBeenCalled();
        expect(mockRes.render).not.toHaveBeenCalled();
    });
});
