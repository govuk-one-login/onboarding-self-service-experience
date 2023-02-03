import {createPublicKey} from "crypto";

const BEGIN = "-----BEGIN PUBLIC KEY-----";
const END = "-----END PUBLIC KEY-----";
export default function getAuthApiCompliantPublicKey(publicKey: string): string {
    publicKey = publicKey.trim();
    // assume PEM with headers
    try {
        return makeAuthCompliant(publicKey);
    } catch (ignored) {}

    try {
        // assume they didn't supply headers
        const publicKeyWithHeaders = `${BEGIN}\n${publicKey}\n${END}\n`;
        return makeAuthCompliant(publicKeyWithHeaders);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to convert\n${publicKey}\n`);
    }
}

function makeAuthCompliant(publicKey: string): string {
    const key = createPublicKey({key: publicKey, format: "pem"});
    return key
        .export({
            format: "pem",
            type: "spki"
        })
        .toString()
        .replace(BEGIN, "")
        .replace(END, "")
        .replace(/\n/g, "")
        .replace(/\r/g, "");
}
