import {NextFunction, Request, Response} from "express";
type MiddlewareFunction<T, U, V> = (T: Request, U: Response, V: NextFunction) => void;

export function passwordValidator(render: string, isLogIn: boolean): MiddlewareFunction<Request, Response, NextFunction> {
    return async (req: Request, res: Response, next: NextFunction) => {
        let password: string = req.body["password"];
        password = password.trim();
        let emailAddress = "";
        if (req.session.emailAddress) {
            emailAddress = req.session.emailAddress;
        }

        if (password === "") {
            res.render(render, {
                errorMessages: {
                    password: "Enter a password"
                },
                values: {emailAddress: emailAddress}
            });
            return;
        }

        if (password.length < 8) {
            res.render(render, {
                values: {
                    password: password,
                    emailAddress: emailAddress
                },
                errorMessages: {password: "Your password must be 8 characters or more"}
            });
            return;
        }
        next();
    };
}
