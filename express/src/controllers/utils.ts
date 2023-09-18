import {createHash} from "crypto";

export function createMd5Hash(text: string) {
    const hash = createHash("md5")
        .update(!!text ? text : "")
        .digest("hex");
    return hash;
}
