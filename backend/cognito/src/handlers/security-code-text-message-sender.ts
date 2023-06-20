import {CustomSMSSenderTriggerEvent} from "aws-lambda";
import {NotifyClient} from "notifications-node-client";
const apiKey = process.env.NOTIFY_API_KEY;
const templateId = process.env.SECURITY_CODE_TEXT_MESSAGE_TEMPLATE;

const notifyClient = new NotifyClient(apiKey);

export const lambdaHandler = async (event: CustomSMSSenderTriggerEvent): Promise<void> => {
    const plainTextCode = event.request.code;
    const phoneNumber = event.request.userAttributes.phone_number;
    await notifyClient.sendSms(templateId, phoneNumber, {
        personalisation: {code: plainTextCode},
        reference: null
    });
};
