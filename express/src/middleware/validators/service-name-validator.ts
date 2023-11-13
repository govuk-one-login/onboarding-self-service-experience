import {RequestHandler} from "express";

export default function validateServiceName(render: string): RequestHandler {
    console.info("In validateServiceName()");

    return (req, res, next) => {
        const serviceName: string = req.body.serviceName.trim();
        if (serviceName.length === 0) {
            return res.render(render, {
                errorMessages: {
                    serviceName: "Enter your service name"
                }
            });
        }
        next();
    };
}
