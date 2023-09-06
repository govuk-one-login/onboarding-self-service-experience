import helmet from "helmet";
export default function Helmet() {
    return helmet({
        referrerPolicy: {
            policy: ["origin", "unsafe-url"]
        },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
                connectSrc: ["*"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'"]
            }
        }
    });
}
