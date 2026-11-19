import path, {dirname} from "path";
import {createRequire} from "module";
import {allowedEmailDomainsSource} from "./environment.js";
import {fileURLToPath} from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const baseDir = path.join(__dirname, "../..");
const resourcesDir = path.join(baseDir, "resources");

const require = createRequire(import.meta.url);
const govukFrontendDir = dirname(require.resolve("govuk-frontend/package.json"));
const nodeModulesDir = dirname(govukFrontendDir);

export const views = [path.join(baseDir, "src/views"), govukFrontendDir, path.join(nodeModulesDir, "@govuk-one-login")];

export const resources = {
    commonPasswords: path.join(resourcesDir, "common-passwords.txt"),
    validDomains: path.join(resourcesDir, allowedEmailDomainsSource.concat(".txt"))
};

export const distribution = {
    assets: path.join(baseDir, "dist/assets"),
    images: path.join(baseDir, "assets/images")
};
