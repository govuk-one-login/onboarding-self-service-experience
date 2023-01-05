import {createPublicKey} from "crypto";

const BEGIN = "-----BEGIN PUBLIC KEY-----";
const END = "-----END PUBLIC KEY-----";
export default function getAuthApiCompliantPublicKey(publicKey: string): string {
    publicKey = publicKey.trim();
    // assume PEM with headers
    try {
        createPublicKey({key: publicKey, format: "pem"});
        return publicKey.replace(BEGIN, "").replace(END, "").replace("\n", "").replace("\r", "");
    } catch (err) {
        console.error(`Failed to convert\n${publicKey}`);
    }

    const publicKeyWithHeaders = `${BEGIN}\n${publicKey}\n${END}\n`;
    try {
        createPublicKey({key: publicKeyWithHeaders, format: "pem"});
        return publicKeyWithHeaders.replace(BEGIN, "").replace(END, "").replace("\n", "").replace("\r", "");
    } catch (err) {
        console.error(`Failed to convert\n${publicKeyWithHeaders}`);
    }

    throw new Error(`Failed to convert\n${publicKey}\n`);
}
