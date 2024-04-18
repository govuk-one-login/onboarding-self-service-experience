import {Request, Response} from "express";
import CognitoInterface from "../src/services/cognito/CognitoInterface";
import LambdaFacadeInterface from "../src/services/lambda-facade/LambdaFacadeInterface";

export const mockLambdaFacade: LambdaFacadeInterface = {
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
    sessionCount: jest.fn()
};

export const mockCogntioInterface: CognitoInterface = {
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

export const request = (properties?: Partial<Request> | object) => ({body: {}, session: {}, params: {}, ...properties} as Request);

export const response = (properties?: Partial<Response>) =>
    ({render: jest.fn(), redirect: jest.fn(), locals: {}, ...properties} as Partial<Response> as Response);
