import {CustomSMSSenderTriggerEvent} from "aws-lambda";
import {NotifyClient} from "notifications-node-client";
import {toByteArray} from "base64-js";
import {buildClient, CommitmentPolicy, KmsKeyringNode} from "@aws-crypto/client-node";

const {decrypt} = buildClient(CommitmentPolicy.REQUIRE_ENCRYPT_ALLOW_DECRYPT);
const generatorKeyId = process.env.DECRYPTION_KEY_ARN;
const keyring = new KmsKeyringNode({generatorKeyId});

const apiKey = process.env.NOTIFY_API_KEY;
const templateId = process.env.SECURITY_CODE_TEXT_MESSAGE_TEMPLATE;
const notifyClient = new NotifyClient(apiKey);

export const lambdaHandler = async (event: CustomSMSSenderTriggerEvent): Promise<void> => {
    if (!event.request.code) {
        throw new Error("Missing code parameter");
    }

    const plainTextCode = await decryptText(event.request.code);
    const phoneNumber = event.request.userAttributes.phone_number;

    await notifyClient.sendSms(templateId, phoneNumber, {
        personalisation: {code: plainTextCode},
        reference: null
    });
};

async function decryptText(encryptedText: string): Promise<string> {
    const {plaintext} = await decrypt(keyring, toByteArray(encryptedText));
    return plaintext.toString();
}
