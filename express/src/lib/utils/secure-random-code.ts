import crypto from "node:crypto";

export const secureRandom6DigitCode = () =>
    crypto
        .randomInt(0, 999999) // Maximum int we can generate with 6 digits
        .toString()
        .padStart(6, "0"); // pad start for less than 6 digits
