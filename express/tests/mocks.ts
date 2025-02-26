import {Request, Response} from "express";
import SelfServiceServicesService from "../src/services/self-service-services-service";

export const mockLambdaFacade = {
    sendTxMALog: jest.fn(),
    getDynamoDBEntries: jest.fn(),
    deleteClientEntries: jest.fn(),
    deleteServiceEntries: jest.fn(),
    generateClient: jest.fn(),
    getUserByCognitoId: jest.fn(),
    globalSignOut: jest.fn(),
    putUser: jest.fn(),
    updateUser: jest.fn(),
    newService: jest.fn(),
    listServices: jest.fn(),
    listClients: jest.fn(),
    updateClient: jest.fn(),
    updateService: jest.fn(),
    sessionCount: jest.fn(),
    getEmailCodeBlock: jest.fn(),
    putEmailCodeBlock: jest.fn(),
    removeEmailCodeBlock: jest.fn()
};

export const mockCognitoInterface = {
    login: jest.fn(),
    adminGetUserCommandOutput: jest.fn(),
    changePassword: jest.fn(),
    confirmForgotPassword: jest.fn(),
    createUser: jest.fn(),
    recoverUser: jest.fn(),
    resendEmailAuthCode: jest.fn(),
    respondToMfaChallenge: jest.fn(),
    sendMobileNumberVerificationCode: jest.fn(),
    setEmailAsVerified: jest.fn(),
    setMfaPreference: jest.fn(),
    resetMfaPreference: jest.fn(),
    setMobilePhoneAsVerified: jest.fn(),
    setNewPassword: jest.fn(),
    setPhoneNumber: jest.fn(),
    setSignUpStatus: jest.fn(),
    setUserPassword: jest.fn(),
    useRefreshToken: jest.fn(),
    verifyMobileUsingSmsCode: jest.fn(),
    forgotPassword: jest.fn(),
    getUser: jest.fn(),
    globalSignOut: jest.fn()
};

export const request = (properties?: Partial<Request> | Record<string, unknown>) => {
    const session = properties?.session;
    delete properties?.session;
    return {
        body: {},
        session: {
            save: jest.fn(),
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
    ({render: jest.fn(), redirect: jest.fn(), locals: {}, ...properties} as Partial<Response> as Response);
