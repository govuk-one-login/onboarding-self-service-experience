import {ElementFor, ElementHandle, Page} from "puppeteer";
import {getElement} from "./elements";
import {clickSubmitButton} from "./navigation";

const Fields = {
    name: "userName",
    email: "emailAddress",
    password: "password",
    "security code": "securityCode",
    "department name": "department",
    "mobile phone number": "mobileNumber",
    "service name": "serviceName",
    "new password": "newPassword",
    "current password": "currentPassword",
    "public key": "publicKey"
} as const;

export type FieldName = keyof typeof Fields;
type InputElementTag = keyof Pick<HTMLElementTagNameMap, "input" | "textarea">;
type InputElement<Tag extends InputElementTag = InputElementTag> = ElementHandle<ElementFor<Tag>>;

export async function enterTextIntoField(page: Page, fieldName: FieldName, value: string, clearValue = false, tag?: InputElementTag) {
    const field = await getFieldElement(page, fieldName, tag);
    if (clearValue) await clearField(field);
    await field.click();
    await field.type(value);
}

export async function submitFieldValue(page: Page, fieldName: FieldName, value: string, tag?: InputElementTag) {
    await enterTextIntoField(page, fieldName, value, true, tag);
    await clickSubmitButton(page);
}

export async function getFieldValue(page: Page, fieldName: FieldName, tag?: InputElementTag) {
    const field = await getFieldElement(page, fieldName, tag);
    return field.evaluate(element => element.value);
}

export function getFieldId(fieldName: FieldName) {
    const field = Fields[fieldName];
    if (!field) throw new Error(`Invalid field name: '${fieldName}'`);
    return field;
}

export function getFieldElement(page: Page, fieldName: FieldName): Promise<InputElement<"input">>;
export function getFieldElement<Tag extends InputElementTag>(page: Page, fieldName: FieldName, tag?: Tag): Promise<InputElement<Tag>>;
export function getFieldElement<Tag extends InputElementTag>(page: Page, fieldName: FieldName, tag?: Tag) {
    return getElement(page, Fields[fieldName], tag ?? "input");
}

async function clearField(field: InputElement) {
    await field.click({clickCount: 3});
    await field.press("Backspace");
}
