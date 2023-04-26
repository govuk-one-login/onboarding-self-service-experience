import {readFile} from "fs/promises";
import {resources} from "../../config/resources";

const minimumPasswordLength = 8;
const commonPasswords = loadCommonPasswords();

export default async function isCommonPassword(password: string): Promise<boolean> {
    const passwords = await commonPasswords;
    return passwords.has(password);
}

async function loadCommonPasswords() {
    const commonPasswords = await readFile(resources.commonPasswords, {encoding: "utf8"});

    const passwords = new Set(
        commonPasswords
            .trim()
            .split("\n")
            .filter(password => password.length >= minimumPasswordLength)
    );

    console.log(`Loaded ${passwords.size} common passwords of ${minimumPasswordLength} characters or more`);
    return passwords;
}
