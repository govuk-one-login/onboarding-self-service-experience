import {readFile} from "fs/promises";
import {resources} from "../../config/resources";

const allowedEmailDomains = loadAllowedEmailDomains();

export default async function hasAllowedDomain(emailAddress: string): Promise<boolean> {
    const domains = await allowedEmailDomains;
    const emailDomain = getEmailDomain(emailAddress);
    return domains.some(domain => emailDomain.endsWith(domain));
}

function getEmailDomain(email: string) {
    return email.split("@")[1];
}

async function loadAllowedEmailDomains(): Promise<string[]> {
    console.log("Loading allowed email domains....");
    return (await readFile(resources.validDomains, {encoding: "utf8"}))
        .trim()
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.startsWith("#"));
}
