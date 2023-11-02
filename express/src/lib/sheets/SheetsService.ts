import SheetsInterface from "./interface";

export default class SheetsService implements SheetsInterface {
    private implementation!: SheetsInterface;
    private spreadsheetId: string;

    constructor(spreadsheetId: string) {
        this.spreadsheetId = spreadsheetId;
    }

    async init() {
        if (process.env.USE_STUB_SHEETS === "true") {
            console.log("Using Stub Sheets Service");
            const module = await import("./stubSheets/stubSheetsService");
            const service = module.default;
            this.implementation = new service(this.spreadsheetId);
        } else {
            console.log("Using the actual implementation of the Sheets Service");
            const module = await import("./realSheets/realSheetsService");
            const service = module.default;
            this.implementation = new service(this.spreadsheetId);
        }
    }

    async appendValues(form: Map<string, string>, dataRange: string, headerRange: string): Promise<void> {
        return this.implementation.appendValues(form, dataRange, headerRange);
    }
}
