import {Config} from "jest";
import baseConfig from "./jest.config.base";

export default {
    ...baseConfig,
    projects: ["express/jest.config.ts", "backend/*/jest.config.ts"]
} satisfies Config;
