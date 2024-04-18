import SheetsService from "../../../src/lib/sheets/SheetsService";

const TEST_SPREADSHEET_ID = "someSpreadSheet";

describe("Sheets Service tests", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        delete process.env.USE_STUB_SHEETS;
        jest.spyOn(console, "log");
    });

    afterEach(() => {
        delete process.env.USE_STUB_SHEETS;
    });

    it("uses stub sheets service when USE_STUB_SHEETS is true", async () => {
        process.env.USE_STUB_SHEETS = "true";
        const sheetService = new SheetsService(TEST_SPREADSHEET_ID);
        await sheetService.init();
        expect(console.log).toHaveBeenCalledWith("Using Stub Sheets Service");
    });
    it("uses real sheets service when USE_STUB_SHEETS is false", async () => {
        process.env.USE_STUB_SHEETS = "false";
        const sheetService = new SheetsService(TEST_SPREADSHEET_ID);
        await sheetService.init();
        expect(console.log).toHaveBeenCalledWith("Using the actual implementation of the Sheets Service");
    });
    it("uses real sheets service when USE_STUB_SHEETS is not set", async () => {
        const sheetService = new SheetsService(TEST_SPREADSHEET_ID);
        await sheetService.init();
        expect(console.log).toHaveBeenCalledWith("Using the actual implementation of the Sheets Service");
    });
});
