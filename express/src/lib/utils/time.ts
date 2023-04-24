export default function parseDate(date: string): string {
    const parsedDate = new Date(date);

    if (parsedDate.toString() === "Invalid Date") {
        throw new Error(`Invalid date string: ${date}`);
    }

    const timestamp = parsedDate.getTime();
    const now = Date.now();

    if (withinMinutesBefore(timestamp, 5, now)) {
        return "just now";
    }

    if (sameDay(timestamp, now)) {
        return "today";
    }

    if (withinDaysBefore(timestamp, 1, now)) {
        return "yesterday";
    }

    return parsedDate.toLocaleDateString("en-gb", {
        weekday: "long",
        day: "numeric",
        year: "numeric",
        month: "long"
    });
}

function withinMinutesBefore(timestamp: number, minutes: number, reference: number) {
    return timestamp >= reference - minutesToMilliseconds(minutes);
}

function sameDay(timestamp: number, reference: number) {
    return withinDaysBefore(timestamp, 0, reference);
}

function withinDaysBefore(timestamp: number, days: number, reference: number) {
    const midnight = new Date(new Date(reference).toDateString()).getTime();
    return timestamp >= midnight - daysToMilliseconds(days);
}

function minutesToMilliseconds(minutes: number) {
    return minutes * 60 * 1000;
}

function daysToMilliseconds(days: number) {
    return days * 24 * minutesToMilliseconds(60);
}
