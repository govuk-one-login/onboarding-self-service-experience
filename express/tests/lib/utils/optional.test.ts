import "lib/utils/optional";

describe("Get requested values if they are non-null or throw an exception", () => {
    describe("Get optional value", () => {
        it("Return the value if present", () => {
            const value: string | undefined = "value";
            expect(nonNull(value)).toBe("value");
        });

        it("Throw if the optional value is undefined", () => {
            const value: string | undefined = undefined;
            expect(() => nonNull(value)).toThrow(ReferenceError);
        });
    });

    describe("Get optional property value of an object", () => {
        interface HasOptionalProperty {
            optional?: string;
        }

        it("Return the value of a requested property if present", () => {
            const object: HasOptionalProperty = {optional: "value"};
            expect(nonNull(object, "optional")).toBe("value");
        });

        it("Throw if the requested property is undefined", () => {
            const object: HasOptionalProperty = {optional: undefined};
            expect(() => nonNull(object, "optional")).toThrow(ReferenceError);
            expect(() => nonNull(object, "optional")).toThrow("optional");
        });

        it("Throw if an invalid property is requested", () => {
            const object: HasOptionalProperty = {};
            expect(() => nonNull(object, "optional")).toThrow(ReferenceError);
            expect(() => nonNull(object, "optional")).toThrow("optional");
        });
    });

    describe("Get optional property values of an object", () => {
        interface HasOptionalProperties {
            [key: string]: string | undefined;
        }

        const object: HasOptionalProperties = {one: "one", two: undefined, three: "three", four: undefined};

        it("Return the values of requested properties if present", () => {
            expect(nonNull(object, "one", "three")).toStrictEqual(expect.objectContaining({one: "one", three: "three"}));
        });

        it("Throw if a requested property is undefined", () => {
            expect(() => nonNull(object, "one", "four")).toThrow(ReferenceError);
            expect(() => nonNull(object, "one", "four")).toThrow("four");
        });

        it("Throw if requested properties are undefined", () => {
            expect(() => nonNull(object, "one", "two", "four")).toThrow(ReferenceError);
            expect(() => nonNull(object, "one", "four", "two")).toThrow(/two.*four|four.*two/);
        });

        it("Throw if an invalid property is requested", () => {
            expect(() => nonNull(object, "one", "five")).toThrow(ReferenceError);
            expect(() => nonNull(object, "one", "five")).toThrow("five");
        });
    });
});
