const getMock = jest.fn();
const appendMock = jest.fn();
const JwtMock = jest.fn();

jest.mock("googleapis-common", () => ({
    JWT: JwtMock
}));

jest.mock("googleapis", () => ({
    google: {
        sheets: jest.fn(() => ({
            spreadsheets: {
                values: {
                    get: getMock,
                    append: appendMock
                }
            }
        }))
    }
}));

import RealSheetsService from "../../../../src/lib/sheets/realSheets/realSheetsService";
import {TEST_DATA_RANGE, TEST_DATA_TO_APPEND, TEST_HEADER_RANGE, TEST_JWT, TEST_SCOPES} from "../../../constants";

const TEST_EMAIL = "SomeEmail";
const TEST_PRIVATE_KEY = "somePrivateKey";
const TEST_SPREADSHEET_ID = "someSpreadSheet";

const TEST_GET_VALUES_RESPONSE = {
    data: {
        values: [["hello"]]
    }
};

const TEST_APPEND_ROWS_RESPONSE = {
    data: {
        values: [["appended"]]
    }
};

describe("RealSheetsService tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        process.env.GOOGLE_SHEET_CREDENTIALS = JSON.stringify({
            client_email: TEST_EMAIL,
            private_key: TEST_PRIVATE_KEY
        });
    });

    afterEach(() => {
        delete process.env.GOOGLE_SHEET_CREDENTIALS;
    });

    it("calls the expected functions when the appendValues method is called", async () => {
        JwtMock.mockResolvedValue(TEST_JWT);
        getMock.mockResolvedValue(TEST_GET_VALUES_RESPONSE);
        appendMock.mockResolvedValue(TEST_APPEND_ROWS_RESPONSE);

        const sheetsService = new RealSheetsService(TEST_SPREADSHEET_ID);
        await sheetsService.appendValues(TEST_DATA_TO_APPEND, TEST_DATA_RANGE, TEST_HEADER_RANGE);

        expect(JwtMock).toHaveBeenCalledWith(TEST_EMAIL, undefined, TEST_PRIVATE_KEY, TEST_SCOPES, undefined);
        expect(getMock).toHaveBeenCalledWith({
            auth: TEST_JWT,
            spreadsheetId: TEST_SPREADSHEET_ID,
            range: TEST_HEADER_RANGE
        });
        expect(appendMock).toHaveBeenCalledWith({
            auth: TEST_JWT,
            spreadsheetId: TEST_SPREADSHEET_ID,
            range: TEST_DATA_RANGE,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            resource: {
                values: [[TEST_DATA_TO_APPEND.get("hello")]]
            }
        });
    });
});
