import helmet from "helmet";
export default function Helmet() {
    return helmet({
        referrerPolicy: {
            policy: ["strict-origin"]
        },
        contentSecurityPolicy: {
            directives: {
                defaultSrc: ["'self'"],
                scriptSrc: [
                    "'self'",
                    "'unsafe-inline'",
                    "https://www.googletagmanager.com",
                    "https://www.google-analytics.com",
                    "https://ssl.google-analytics.com"
                ],
                styleSrc: ["'self'"],
                imgSrc: ["'self'", "data:", "https://www.googletagmanager.com", "https://www.google-analytics.com"],
                objectSrc: ["'none'"],
                connectSrc: ["'self'", "https://www.google-analytics.com"],
                formAction: ["'self'"]
            }
        },
        dnsPrefetchControl: {
            allow: false
        },
        frameguard: {
            action: "deny"
        },
        hsts: {
            maxAge: 31536000, // 1 Year
            preload: true,
            includeSubDomains: true
        },
        permittedCrossDomainPolicies: false
    });
}
