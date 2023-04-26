import SelfServiceSessionData from "../types/session-data";

declare module "express-session" {
    // eslint-disable-next-line @typescript-eslint/no-empty-interface
    interface SessionData extends SelfServiceSessionData {}
}
