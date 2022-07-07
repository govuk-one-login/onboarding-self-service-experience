import {NextFunction, Request, Response} from "express";
import {URL} from "url";
type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;
export function uriValidator(uri: [] , req : Request, res : Response) {
    for (let i = 0; i < uri.length; i++) {
        if (!isUriValid(uri[i])) {
            return false;
        }
    }
    return true;
    }

export function isUriValid(uri: string) {
    try {
        const url = new URL(uri);
        if (url.protocol !== 'http:' && url.protocol !== 'https:' ) {
            return false;
        }

        if (url.protocol === 'http:') {
            if (url.hostname === 'localhost') {
                return true;
            }
            return false;
        }

    } catch (err) {
        console.log(err)
        return false;
    }

    return true;
}