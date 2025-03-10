import {Logger} from "@aws-lambda-powertools/logger";

const logger = new Logger({
    serviceName: "self-service-experience"
});

export {logger};
