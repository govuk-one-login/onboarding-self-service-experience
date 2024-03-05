import {Config} from "jest";
import baseConfig from "../../jest.config.base";

export default {
    ...baseConfig,
    displayName: "api",
    setupFiles: ["./tests/setup.ts"]
} satisfies Config;
