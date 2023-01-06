import {createPublicKey} from "crypto";

const BEGIN = "-----BEGIN PUBLIC KEY-----";
const END = "-----END PUBLIC KEY-----";
export default function getAuthApiCompliantPublicKey(publicKey: string): string {
    publicKey = publicKey.trim();
    // assume PEM with headers
    try {
        createPublicKey({key: publicKey, format: "pem"});
        return publicKey.replace(BEGIN, "").replace(END, "").replace(/\n/g, "").replace(/\r/g, "");
    } catch (ignored) {}
    // assume they didn't supply headers
    const publicKeyWithHeaders = `${BEGIN}\n${publicKey}\n${END}\n`;

    try {
        createPublicKey({key: publicKeyWithHeaders, format: "pem"});
        return publicKeyWithHeaders.replace(BEGIN, "").replace(END, "").replace(/\n/g, "").replace(/\r/g, "");
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to convert\n${publicKey}\n`);
    }
}
