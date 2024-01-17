import {Config} from "jest";
import baseConfig from "../../../../jest.config.base";

export default {
    ...baseConfig,
    displayName: "api pact-tests",
    preset: "ts-jest",
    testTimeout: 200000,
    transform: {
        "^.+\\.(ts|tsx)?$": "ts-jest",
        "^.+\\.(js|jsx)$": "babel-jest"
    }
} satisfies Config;
