import {EnvironmentVariable} from "../types/handler-env-var";

export const getEnvOrThrow = (name: EnvironmentVariable): string => {
    const envVar = process.env[name];

    if (!envVar) {
        throw new Error("Missing Environment Variable: " + name);
    }

    return envVar;
};
