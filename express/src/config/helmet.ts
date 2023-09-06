import helmet from "helmet";
export default function Helmet() {
    return helmet({
        referrerPolicy: {
            policy: ["strict-origin"]
        },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                connectSrc: ["*"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'"],
                formAction: ["'self'"]
            }
        }
    });
}
