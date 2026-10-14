import { RequestHandler } from "express";
import { getEnvOrThrow } from "../lib/utils/get-env";

export const showPrototypePage: RequestHandler = (_, res) => {
    const prototypePassword = getEnvOrThrow('PROTOTYPE_PASSWORD')
    res.render("clients/prototype.njk", {
       password: prototypePassword
    });
};
