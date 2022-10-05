import fs from "fs/promises";

async function loadEmails(): Promise<string[]> {
    const data = fs.readFile("resources/allowed-email-domains.txt", {
        encoding: "utf8"
    });
    return (await data).split("\n");
}

export default loadEmails();
