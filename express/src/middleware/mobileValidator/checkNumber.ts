import {RenderError} from "../../lib/errors";

export function isValidOrThrow(number: string, template: string): void {
    let processing: string;

    try {
        notBlank(number);
    } catch (error) {
        if (error instanceof RenderError) {
            throw new RenderError(template, "", {
                values: {
                    mobileNumber: number
                },
                errorMessages: {
                    mobileNumber: "Enter a mobile phone number"
                }
            });
        } else {
            throw error;
        }
    }

    processing = removeParentheses(number);

    try {
        processing = getUniquePart(processing);
    } catch (error) {
        if (error instanceof RenderError) {
            throw new RenderError(template, "", {
                values: {
                    mobileNumber: number
                },
                errorMessages: {
                    mobileNumber: "Enter a UK mobile phone number, like 07700 900000"
                }
            });
        } else {
            throw error;
        }
    }

    processing = removeSpacingCharacters(processing);

    try {
        ensureExactlyTenNumbersRemain(processing);
    } catch (error) {
        console.log(processing);
        console.log(number);
        if (error instanceof RenderError) {
            throw new RenderError(template, "", {
                values: {
                    mobileNumber: number
                },
                errorMessages: {
                    mobileNumber: "Enter a UK mobile phone number using numbers only"
                }
            });
        } else {
            throw error;
        }
    }
}

export function notBlank(number: string) {
    if (!number) {
        throw new RenderError("");
    }
}

export function getUniquePart(mobileNumber: string): string {
    if (mobileNumber.trim().startsWith("+44")) {
        return mobileNumber.trim().substring("+44".length);
    }

    if (mobileNumber.trim().startsWith("07")) {
        return mobileNumber.trim().substring("0".length);
    }

    throw new RenderError("");
}

export function removeParentheses(number: string) {
    return number.trim().replace(/^\((.*)\)(.*)$/g, "$1$2");
}

export function removeSpacingCharacters(number: string) {
    return number.replace(/\ |\-/g, "");
}

export function ensureExactlyTenNumbersRemain(number: string): void {
    if (!/^[0-9]{10}$/.test(number.trim())) {
        throw new RenderError("");
    }
}

export function prepareForCognito(number: string): string {
    let processing = removeParentheses(number);
    processing = getUniquePart(processing);
    return `+44${removeSpacingCharacters(processing)}`;
}
