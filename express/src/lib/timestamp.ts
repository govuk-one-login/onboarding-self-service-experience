export default function getTimestamp(): string {
    const pad = (n: number, s = 2) => `${new Array(s).fill(0)}${n}`.slice(-s);
    const d = new Date();

    return `${pad(d.getFullYear(), 4)}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(
        d.getSeconds()
    )}.${pad(d.getMilliseconds(), 3)}`;
}
