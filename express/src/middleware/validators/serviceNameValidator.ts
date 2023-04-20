import {NextFunction, Request, Response} from "express";

export async function serviceNameValidator(req: Request, res: Response, next: NextFunction) {
    const serviceName: string = req.body.serviceName.trim();

    if (serviceName.length == 0) {
        res.render("register/add-service-name.njk", {
            errorMessages: {
                serviceName: "Enter your service name"
            }
        });

        return;
    }

    next();
}
