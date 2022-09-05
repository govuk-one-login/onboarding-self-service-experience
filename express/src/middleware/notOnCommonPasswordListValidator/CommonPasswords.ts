import fs from "fs/promises";

export class CommonPasswords {
    private static MINIMUM_PASSWORD_LENGTH = 8;
    private commonPasswords: Map<string, boolean>;

    private constructor() {
        this.commonPasswords = new Map<string, boolean>();
    }

    static async loadCommonPasswords(): Promise<CommonPasswords> {
        const instance: CommonPasswords = new CommonPasswords();
        const data = fs
            .readFile("./top-100k-common-passwords.txt", {
                encoding: "utf8"
            })
            .catch(error => {
                console.error("List of 10k most common passwords could not be loaded. We will not be starting the application");
                console.error(error);
                process.kill(process.pid, "SIGTERM");
                throw error; // this keeps the compiler happy about using data next.
            });

        const arr = (await data).split("\n");
        arr.filter(p => p.length >= this.MINIMUM_PASSWORD_LENGTH).forEach(p => instance.commonPasswords.set(p, true));
        console.log(`Loaded ${instance.commonPasswords.size} common passwords of ${this.MINIMUM_PASSWORD_LENGTH} characters or more.`);
        return instance;
    }

    notOnList(password: string): boolean {
        return !this.commonPasswords.get(password);
    }
}
