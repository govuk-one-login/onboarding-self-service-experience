import {promises as fs} from "fs";
import {JWT} from "googleapis-common";
import {google} from "googleapis";
import SheetsService from "../interface";

export default class RealSheetsService implements SheetsService {
    private readonly SCOPES: string[] = ["https://www.googleapis.com/auth/spreadsheets"];
    private readonly SPREADSHEET_ID: string;

    private jwt: JWT | undefined = undefined;

    constructor(spreadsheetId: string) {
        this.SPREADSHEET_ID = spreadsheetId;
    }

    private static async readCreds(): Promise<string> {
        let serviceCredentials = "";
        try {
            serviceCredentials = JSON.parse(process.env.GOOGLE_SHEET_CREDENTIALS || "null");
        } catch (error) {
            console.log("RealSheetsService: parse had error: " + error);
            throw error;
        }

        if (serviceCredentials) {
            let googleCreds = "";
            try {
                googleCreds = JSON.stringify(serviceCredentials);
            } catch (error) {
                console.log("RealSheetsService: stringify had error: " + error);
                throw error;
            }
            return googleCreds;
        } else {
            return await fs.readFile("./googleCredentials.json", "utf-8");
        }
    }

    // eslint-disable-next-line
    private async createToken(data: any): Promise<JWT> {
        return new Promise(async (resolve, reject) => {
            try {
                const creds = JSON.parse(data);
                this.jwt = new JWT(creds.client_email, undefined, creds.private_key, this.SCOPES, undefined);
                resolve(this.jwt);
            } catch (error) {
                reject(error);
            }
        });
    }

    // eslint-disable-next-line
    private async readRange(token: JWT, range: string, sheetId: string): Promise<any[][]> {
        return new Promise(async function (resolve, reject) {
            const sheets = google.sheets("v4");
            try {
                const response = await sheets.spreadsheets.values.get({
                    auth: token,
                    spreadsheetId: sheetId,
                    range: range
                });
                const data = response.data;
                console.debug("Values: " + data.values);
                if (data.values) {
                    resolve(data.values);
                } else {
                    reject(new Error(`No values returned for range ${range} from sheet with ID ${sheetId}`));
                }
            } catch (error) {
                console.log(error);
                reject(new Error(`Could not read range ${range} from sheet with ID ${sheetId}`));
            }
        });
    }

    // eslint-disable-next-line
    private async createRow(token: JWT, form: Map<string, string>, headings: any[][]): Promise<any[][]> {
        // eslint-disable-next-line
        const row: any[] = [];
        headings[0].forEach(heading => {
            row.push(form.get(heading));
        });
        return row;
    }

    // eslint-disable-next-line
    private async appendRow(token: JWT, range: string, row: any[]) {
        console.log("Sheets Service insert range: " + range);
        // eslint-disable-next-line
        const request: any = {
            auth: token,
            spreadsheetId: this.SPREADSHEET_ID,
            range: range,
            valueInputOption: "USER_ENTERED",
            insertDataOption: "INSERT_ROWS",
            resource: {
                values: [row]
            }
        };

        const sheets = google.sheets("v4");
        const response = (await sheets.spreadsheets.values.append(request)).data;
        console.log("Sheets Service row appended: " + JSON.stringify(response, null, 2));
    }

    async appendValues(form: Map<string, string>, dataRange: string, headerRange: string): Promise<void> {
        const creds: string = await RealSheetsService.readCreds();
        const token: JWT = await this.createToken(creds);
        // eslint-disable-next-line
        const headings: any[] = await this.readRange(token, headerRange, this.SPREADSHEET_ID);
        // eslint-disable-next-line
        const dataToInsert: any[] = await this.createRow(token, form, headings);
        await this.appendRow(token, dataRange, dataToInsert);
    }
}
