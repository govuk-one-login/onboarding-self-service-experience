import {Config} from "jest";
import baseConfig from "../../jest.config.base";

export default {
    ...baseConfig,
    displayName: "api"
} satisfies Config;
