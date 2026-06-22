import logger from "../../logger";
import SheetsService from "../interface";

export default class StubSheetsService implements SheetsService {
    private readonly spreadsheetId: string;

    constructor(spreadsheetId: string) {
        logger.debug("StubSheetsServiceConstructor");
        this.spreadsheetId = spreadsheetId;
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    async appendValues(form: Map<string, string>, dataRange: string, headerRange: string): Promise<void> {
        return new Promise<void>(resolve => {
            logger.debug(`Pretending to save data to sheet "${this.spreadsheetId}"`);
            resolve();
        });
    }
}
