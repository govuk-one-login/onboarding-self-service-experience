import {Request, Response} from "express";
import SelfServiceServicesService from "../src/services/self-service-services-service.js";

export const mockLambdaFacade = {
    sendTxMALog: vi.fn(),
    getDynamoDBEntries: vi.fn(),
    deleteClientEntries: vi.fn(),
    deleteServiceEntries: vi.fn(),
    generateClient: vi.fn(),
    getUserByCognitoId: vi.fn(),
    globalSignOut: vi.fn(),
    putUser: vi.fn(),
    updateUser: vi.fn(),
    newService: vi.fn(),
    listServices: vi.fn(),
    listClients: vi.fn(),
    updateClient: vi.fn(),
    updateService: vi.fn(),
    sessionCount: vi.fn(),
    getEmailCodeBlock: vi.fn(),
    putEmailCodeBlock: vi.fn(),
    removeEmailCodeBlock: vi.fn()
};

export const mockCognitoInterface = {
    login: vi.fn(),
    adminGetUserCommandOutput: vi.fn(),
    changePassword: vi.fn(),
    confirmForgotPassword: vi.fn(),
    createUser: vi.fn(),
    recoverUser: vi.fn(),
    resendEmailAuthCode: vi.fn(),
    respondToMfaChallenge: vi.fn(),
    sendMobileNumberVerificationCode: vi.fn(),
    setEmailAsVerified: vi.fn(),
    setMfaPreference: vi.fn(),
    resetMfaPreference: vi.fn(),
    setMobilePhoneAsVerified: vi.fn(),
    setNewPassword: vi.fn(),
    setPhoneNumber: vi.fn(),
    setPhoneNumberWithoutAdmin: vi.fn(),
    setSignUpStatus: vi.fn(),
    setUserPassword: vi.fn(),
    useRefreshToken: vi.fn(),
    verifyMobileUsingSmsCode: vi.fn(),
    forgotPassword: vi.fn(),
    getUser: vi.fn(),
    globalSignOut: vi.fn()
};

export const request = (properties?: Partial<Request> | Record<string, unknown>) => {
    const session = properties?.session;
    delete properties?.session;
    return {
        body: {},
        session: {
            save: vi.fn(),
            ...(session as Partial<Request["session"]>)
        },
        app: {
            get: (keyName: string) => {
                if (keyName === "backing-service") return new SelfServiceServicesService(mockCognitoInterface, mockLambdaFacade);
            }
        },
        params: {},
        ...properties
    } as Request;
};

export const response = (properties?: Partial<Response>) =>
    ({render: vi.fn(), redirect: vi.fn(), locals: {}, ...properties} as Partial<Response> as Response);
