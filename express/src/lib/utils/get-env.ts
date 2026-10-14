export type FrontendEnvironmentVariable = "PROTOTYPE_PASSWORD";

export const getEnvOrThrow = (name: FrontendEnvironmentVariable): string => {
    const envVar = process.env[name];

    if (!envVar) {
        throw new Error("Missing Environment Variable: " + name);
    }

    return envVar;
};
