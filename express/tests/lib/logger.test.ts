import logger from "../../src/lib/logger";

describe("Logger", () => {
    it("should export a logger instance", () => {
        expect(logger).toBeDefined();
        expect(typeof logger.info).toBe("function");
        expect(typeof logger.error).toBe("function");
        expect(typeof logger.warn).toBe("function");
        expect(typeof logger.debug).toBe("function");
    });

    it("should have correct log level", () => {
        const expectedLevel = process.env.LOG_LEVEL || "info";
        expect(logger.level).toBe(expectedLevel);
    });
});