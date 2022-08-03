import { strict as assert } from 'assert'
import DynamoClient from "../../src/client/DynamoClient";

describe('DynamoDB client', function () {
    const client = new DynamoClient("identities");

    const updates = {
        services: ['Juggling license', 'Unicorn registration'],
        email: 'name@gov.uk',
        attempts: 10,
        verified: true,
        data: 'Tessa Ting'
    };

    it('should generate correct expression attribute names', function () {
        const generatedExpressionAttributeNames = client.generateExpressionAttributeNames(Object.keys(updates));
        const expectedExpressionAttributeNames = {
            '#services': 'services',
            '#email': 'email',
            '#attempts': 'attempts',
            '#verified': 'verified',
            '#D': 'data'
        };

        assert.deepEqual(generatedExpressionAttributeNames, expectedExpressionAttributeNames);
    });

    it('should generate correct update expression', function () {
        const updateExpression = client.generateUpdateExpression(Object.keys(updates));
        const expectedUpdateExpression = 'set #services = :services, set #email = :email, set #attempts = :attempts, set #verified = :verified, set #D = :data';

        assert.equal(updateExpression, expectedUpdateExpression);
    });

    it('should correctly generate attribute values for an update expression', function () {
        const attributeValues = client.generateExpressionAttributeValues(Object.keys(updates), updates);
        const expectedAttributeValues = {
            ':services': {L: [{S: 'Juggling license'}, {S: 'Unicorn registration'}]},
            ':email': {S: 'name@gov.uk'},
            ':attempts': {N: '10'},
            ':verified': {BOOL: true},
            ':data': {S: 'Tessa Ting'},
        }

        assert.deepEqual(attributeValues, expectedAttributeValues);
    });
});
