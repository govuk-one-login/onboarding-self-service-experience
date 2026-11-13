import {Config} from "jest";
import baseConfig from "../../jest.config.js";

export default {
    ...baseConfig,
    reporters: [["github-actions", {silent: false}], "summary"]
} satisfies Config;
