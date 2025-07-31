import {randomInt} from "crypto";

export const secureRandom6DigitCode = () =>
    randomInt(0, 10 ** 6 - 1) //10 ** 6 sets maximum value, less one to keep it six digits
        .toString()
        .padStart(6, "0"); // pad start for less than 6 digits
