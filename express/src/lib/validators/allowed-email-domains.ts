import {readFile} from "fs/promises";
import {resources} from "../../config/resources";
import logger from "../logger";

const allowedEmailDomains = loadAllowedEmailDomains();

export default async function hasAllowedDomain(emailAddress: string): Promise<boolean> {
    const domains = await allowedEmailDomains;
    const emailDomain = getEmailDomain(emailAddress);
    return domains.some(domain => emailDomain === domain || emailDomain.endsWith("." + domain));
}

function getEmailDomain(email: string) {
    return email.split("@")[1];
}

async function loadAllowedEmailDomains(): Promise<string[]> {
    logger.debug("Loading allowed email domains....");
    return (await readFile(resources.validDomains, {encoding: "utf8"}))
        .trim()
        .split("\n")
        .map(line => line.trim())
        .filter(line => line.length > 0)
        .filter(line => !line.startsWith("#"));
}
