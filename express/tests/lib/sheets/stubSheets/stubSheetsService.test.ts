import StubSheetsService from "../../../../src/lib/sheets/stubSheets/stubSheetsService";
import {TEST_SPREAD_SHEET_ID} from "../../../constants";

describe("stub Sheets Service tests", () => {
    beforeEach(async () => {
        jest.clearAllMocks();
        jest.spyOn(console, "log");
    });

    it("logs stub service when the constructor is called", () => {
        new StubSheetsService(TEST_SPREAD_SHEET_ID);
        expect(console.log).toHaveBeenCalledWith("StubSheetsServiceConstructor");
    });

    it("logs pretending to save to spreadsheet when the appendValue Method is called", async () => {
        const sheetService = new StubSheetsService(TEST_SPREAD_SHEET_ID);
        await sheetService.appendValues(new Map(), "someDateRage", "someHeaderRange");
        expect(console.log).toHaveBeenCalledWith(`Pretending to save data to sheet "${TEST_SPREAD_SHEET_ID}"`);
    });
});
