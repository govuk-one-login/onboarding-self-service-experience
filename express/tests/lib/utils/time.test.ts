import parseDate from "../../../src/lib/utils/time";

const now = new Date("2023-03-01T15:00:00Z");

jest.useFakeTimers();
jest.setSystemTime(now);

describe("Parse date strings relative to the current time", () => {
    it("Throw if an invalid date string is provided", () => {
        expect(() => parseDate("bad-date-string")).toThrow(/invalid/i);
    });

    describe("Parse valid date strings", () => {
        it("Parse date strings in ISO format", () => {
            expect(parseDate("2000-01-04T10:00:00Z")).toEqual("Tuesday, 4 January 2000");
        });

        describe.each([2, 5])("Recognise a recent timestamp", minutes => {
            it(`${minutes} minutes earlier`, () => {
                expect(parseDate(minutesEarlier(minutes))).toEqual("just now");
            });
        });

        describe.each([
            {timestamp: minutesEarlier(5, 1), name: "Over 5 minutes ago"},
            {timestamp: hoursEarlier(5), name: "5 hours ago"},
            {timestamp: lastMidnight(), name: "Last midnight"}
        ])("Recognise a timestamp within the same day", ({timestamp, name}) => {
            it(name, () => {
                expect(parseDate(timestamp)).toEqual("today");
            });
        });

        describe.each([
            [23, 59, 59],
            [10, 0, 0],
            [0, 0, 0]
        ])("Recognise a timestamp up to yesterday", (hours, minutes, seconds) => {
            it(`Yesterday at ${hours}h${minutes}m${seconds}s`, () => {
                expect(parseDate(yesterdayAt(hours, minutes, seconds))).toEqual("yesterday");
            });
        });

        describe.each([
            {timestamp: daysBeforeAt(2, 23, 59, 59), name: "Over a day ago", expected: "Monday, 27 February 2023"},
            {timestamp: daysBeforeAt(2, 10), name: "2 days ago", expected: "Monday, 27 February 2023"},
            {timestamp: daysBeforeAt(4, 11), name: "4 days ago", expected: "Saturday, 25 February 2023"},
            {timestamp: daysBeforeAt(6, 12), name: "6 days ago", expected: "Thursday, 23 February 2023"},
            {timestamp: daysBeforeAt(45, 8), name: "Over a month ago", expected: "Sunday, 15 January 2023"}
        ])("Recognise a timestamp more than a day ago", ({timestamp, name, expected}) => {
            it(name, () => {
                expect(parseDate(timestamp)).toEqual(expected);
            });
        });
    });
});

function minutesEarlier(minutes: number, seconds = 0) {
    return new Date(now.getTime() - (minutes * 60 + seconds) * 1000).toISOString();
}

function hoursEarlier(hours: number) {
    return minutesEarlier(hours * 60);
}

function lastMidnight() {
    return daysBeforeAt(0, 0);
}

function yesterdayAt(hours: number, minutes = 0, seconds = 0) {
    return daysBeforeAt(1, hours, minutes, seconds);
}

function daysBeforeAt(daysBefore: number, hours: number, minutes = 0, seconds = 0) {
    const pastDay = new Date(now.getTime() - daysBefore * 24 * 60 * 60 * 1000);
    pastDay.setHours(hours);
    pastDay.setMinutes(minutes, seconds);
    return pastDay.toISOString();
}
