import {responseSerializer} from "../src/lib/requestLogging";

describe("Request Logging Middleware Configuration", () => {
    it("should serialize response with only allowed headers", () => {
        const mockRes = {
            statusCode: 200,
            raw: {
                getHeader: (name: string) => {
                    const headers: Record<string, string> = {
                        "content-type": "text/html",
                        "content-length": "123",
                        etag: 'W/"123"',
                        "content-security-policy": "default-src 'self'"
                    };
                    return headers[name];
                }
            }
        };

        const serialized = responseSerializer(mockRes);
        expect(serialized.statusCode).toBe(200);
        expect(serialized.headers["content-type"]).toBe("text/html");
        expect(serialized.headers["content-length"]).toBe("123");
        expect(serialized.headers["etag"]).toBe('W/"123"');
        expect((serialized.headers as Record<string, string>)["content-security-policy"]).toBeUndefined();
    });
});
