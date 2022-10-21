import path from "path";

const RESOURCES_DIR = path.join(__dirname, "../../resources");

export const resources = {
    commonPasswords: path.join(RESOURCES_DIR, "common-passwords.txt"),
    validDomains: path.join(RESOURCES_DIR, "allowed-email-domains.txt")
};

export const views = path.join(__dirname, "../../src/views");
