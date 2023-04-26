import {createPublicKey} from "crypto";

const BEGIN = "-----BEGIN PUBLIC KEY-----";
const END = "-----END PUBLIC KEY-----";

export default function getAuthApiCompliantPublicKey(publicKey: string): string {
    try {
        return makeAuthCompliant(publicKey);
    } catch (err) {
        console.error(err);
        throw new Error(`Failed to convert public key\n${publicKey}`);
    }
}

function makeAuthCompliant(publicKey: string) {
    return createPublicKey({key: prepareKey(publicKey), format: "pem"})
        .export({format: "pem", type: "spki"})
        .toString()
        .replace(BEGIN, "")
        .replace(END, "")
        .replaceAll(/[\n\r]/g, "");
}

function prepareKey(publicKey: string) {
    publicKey = publicKey.trim();

    const hasHeader = publicKey.includes(BEGIN);
    const hasFooter = publicKey.includes(END);

    const publicKeyContent = publicKey
        .substring(hasHeader ? publicKey.indexOf(BEGIN) + BEGIN.length : 0, hasFooter ? publicKey.indexOf(END) : undefined)
        .replaceAll(/[\n\r\s]/g, "");

    return `${BEGIN}\n${publicKeyContent}\n${END}`;
}
