import isCommonPassword from "lib/commonPasswords/CommonPasswords";

jest.mock("fs/promises", () => {
    return {
        readFile: jest.fn(() => "common-password")
    };
});

describe("Check if a password is allowed", () => {
    it("Reject a commonly used password", async () => {
        expect(await isCommonPassword("common-password")).toBe(true);
    });

    it("Accept a password not on the common passwords list", async () => {
        expect(await isCommonPassword("unique-password")).toBe(false);
    });
});
