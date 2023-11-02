export default interface SheetsInterface {
    appendValues(form: Map<string, string>, dataRange: string, headerRange: string): Promise<void>;
}
