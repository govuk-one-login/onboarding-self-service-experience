import {Request, Response} from "express";

export const request = (properties?: Partial<Request> | object) => ({body: {}, session: {}, params: {}, ...properties} as Request);

export const response = (properties?: Partial<Response>) =>
    ({render: jest.fn(), redirect: jest.fn(), locals: {}, ...properties} as Partial<Response> as Response);
