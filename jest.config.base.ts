import {Config} from "jest";

export default {
    modulePaths: ["<rootDir>/../src"],
    rootDir: "tests",
    preset: "ts-jest",
    clearMocks: true
} satisfies Config;
