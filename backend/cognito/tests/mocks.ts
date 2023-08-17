import {CustomSMSSenderTriggerEvent} from "aws-lambda";

export const smsSenderTrigger = (number: string, code?: string) =>
    ({request: {code: code, userAttributes: {phone_number: number}}} as unknown as CustomSMSSenderTriggerEvent);
