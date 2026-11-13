import SelfServiceSessionData from "../types/session-data.js";

declare module "express-session" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface SessionData extends SelfServiceSessionData {}
}
