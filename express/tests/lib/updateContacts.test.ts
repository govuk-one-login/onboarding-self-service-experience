import {removeContact, addContact} from "../../src/lib/updateContacts";

describe("removeContact", () => {
    test("should remove a contact that exists and is not the initial one", () => {
        const contacts = ["test1@test.gov.uk", "test2@test.gov.uk", "test3@test.gov.uk"];
        const contactToRemove = "test2@test.gov.uk";
        const updatedContacts = removeContact(contacts, contactToRemove);
        expect(updatedContacts).toEqual(["test1@test.gov.uk", "test3@test.gov.uk"]);
    });

    test("should not remove the initial contact", () => {
        const contacts = ["test1@test.gov.uk", "test2@test.gov.uk", "test3@test.gov.uk"];
        const contactToRemove = "test1@test.gov.uk";
        const result = removeContact(contacts, contactToRemove);
        expect(result).toBe("Not updated. Initial contact can not be updated or removed.");
    });

    test("should return an error message if contact not found", () => {
        const contacts = ["test1@test.gov.uk", "test2@test.gov.uk", "test3@test.gov.uk"];
        const contactToRemove = "test4@test.gov.uk";
        const result = removeContact(contacts, contactToRemove);
        expect(result).toBe("Not updated. Contact not found");
    });
});

describe("addContact", () => {
    test("should add a new contact if it does not already exist", () => {
        const contacts = ["test1@test.gov.uk", "test2@test.gov.uk", "test3@test.gov.uk"];
        const newContact = "test4@test.gov.uk";
        const updatedContacts = addContact(newContact, contacts);
        expect(updatedContacts).toContain(newContact);
    });

    test("should not add a contact that already exists", () => {
        const contacts = ["test1@test.gov.uk", "test2@test.gov.uk", "test3@test.gov.uk"];
        const newContact = "test2@test.gov.uk";
        const result = addContact(newContact, contacts);
        expect(result).toBe("This contact has already been added");
    });
});
