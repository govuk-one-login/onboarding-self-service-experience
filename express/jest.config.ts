import {Config} from "jest";
import baseConfig from "../jest.config.base";

export default {
    ...baseConfig,
    displayName: "frontend",
    setupFiles: ["<rootDir>/src/config/express.ts"],
    globalSetup: "<rootDir>/tests/setup.ts"
} satisfies Config;
