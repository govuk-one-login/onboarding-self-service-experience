export function removeContact(contacts: string[], contactToRemove: string): string[] | string {
    const index = contacts.indexOf(contactToRemove);
    if (index === -1) {
        return "Not updated. Contact not found";
    }
    if (index === 0) {
        return "Not updated. Initial contact can not be updated or removed.";
    }
    const updatedContacts = [...contacts];
    updatedContacts.splice(index, 1);
    return updatedContacts;
}

export function addContact(item: string, array: string[]): string[] | string {
    if (array.includes(item)) {
        return "Contact already exists";
    } else {
        array.push(item);
        return array;
    }
}
