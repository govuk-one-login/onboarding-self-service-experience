import {Config} from "jest";

export default {
    rootDir: ".",
    preset: "ts-jest",
    clearMocks: true,
    moduleDirectories: ["node_modules", "src"]
} satisfies Config;
