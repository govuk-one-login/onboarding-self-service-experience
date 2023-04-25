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

async function loadAllowedEmailDomains() {
    console.log("Loading allowed email domains....");
    const domains = await readFile(resources.validDomains, {encoding: "utf8"});
    return domains.trim().split("\n");
}
