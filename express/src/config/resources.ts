import path from "path";
import {allowedEmailDomainsSource} from "./environment";

const baseDir = path.join(__dirname, "../..");
const resourcesDir = path.join(baseDir, "resources");

export const views = path.join(baseDir, "src/views");

export const resources = {
    commonPasswords: path.join(resourcesDir, "common-passwords.txt"),
    validDomains: path.join(resourcesDir, allowedEmailDomainsSource.concat(".txt"))
};

export const distribution = {
    assets: path.join(baseDir, "dist/assets"),
    images: path.join(baseDir, "assets/images")
};
