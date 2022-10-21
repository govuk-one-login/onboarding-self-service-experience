import fs from "fs/promises";
import {resources} from "../config/resources";

async function loadEmails(): Promise<string[]> {
    const data = fs.readFile(resources.validDomains, {encoding: "utf8"});
    return (await data).split("\n");
}

export default loadEmails();
