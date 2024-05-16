const helmetMock = jest.fn();

jest.mock("helmet", () => helmetMock);

import Helmet from "../../src/config/helmet";
import {TEST_HELMET_CONFIG} from "../constants";

describe("helmet config tests", () => {
    it("applies the expected values when calling the Helmet function", () => {
        Helmet();
        expect(helmetMock).toHaveBeenCalledTimes(1);
        expect(helmetMock).toHaveBeenCalledWith(TEST_HELMET_CONFIG);
    });
});
