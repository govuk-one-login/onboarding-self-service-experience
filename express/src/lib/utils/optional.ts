globalThis.nonNull = nonNull;

function nonNull<Type>(value: Type | undefined): NonNullable<Type>;
function nonNull<Type, Key extends keyof Type>(object: Type, property: Key): NonNullable<Type[Key]>;
function nonNull<Type, Key extends keyof Type>(object: Type, ...properties: Key[]): NonNullable<Pick<Type, Key>>;
function nonNull<Type, Key extends keyof Type>(object: Type, ...properties: Key[]): NonNullable<Type | Type[Key] | Pick<Type, Key>> {
    if (properties.length == 0) {
        return tryGetValue(object);
    }

    if (properties.length == 1) {
        return tryGetProperty(object, properties[0]);
    }

    return tryGetProperties(object, properties);
}

function tryGetValue<Type>(value: Type | undefined): NonNullable<Type> {
    if (value) {
        return value;
    }

    throw new ReferenceError();
}

function tryGetProperty<Type, Key extends keyof Type>(object: Type, property: Key): NonNullable<Type[Key]> {
    const value = object[property];

    if (value) {
        return value;
    }

    throw new ReferenceError(`Property '${property.toString()}' is undefined`);
}

function tryGetProperties<Type, Key extends keyof Type>(object: Type, keys: Key[]): NonNullable<Pick<Type, Key>> {
    const values = {} as Pick<Type, Key>;

    keys.forEach(key => {
        const value = object[key];
        if (value) {
            values[key] = value;
        }
    });

    const properties = Object.keys(values);

    if (properties.length < keys.length) {
        const missing = keys.filter(key => !properties.includes(key.toString()));
        throw new ReferenceError(`Undefined properties (${missing.join(" | ")})`);
    }

    return values;
}
