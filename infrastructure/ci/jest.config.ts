import {Config} from "jest";
import baseConfig from "../../jest.config";

export default {
    ...baseConfig,
    reporters: [["github-actions", {silent: false}], "summary"]
} as Config;
