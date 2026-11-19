import helmet from "helmet";
import Helmet from "../../src/config/helmet.js";
import {TEST_HELMET_CONFIG} from "../constants.js";

vi.mock("helmet", () => ({default: vi.fn()}));

describe("helmet config tests", () => {
    it("applies the expected values when calling the Helmet function", () => {
        const helmetMock = vi.mocked(helmet);
        Helmet();
        expect(helmetMock).toHaveBeenCalledTimes(1);
        expect(helmetMock).toHaveBeenCalledWith(TEST_HELMET_CONFIG);
    });
});
