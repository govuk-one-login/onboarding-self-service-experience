import DynamoClient from "../../src/client/DynamoClient";

describe('DynamoDB client', () => {
    describe('table name not set', () => {
        it('should throw if table name not provided', () => {
            expect(() => new DynamoClient()).toThrow('Table name');
        });
    });

    describe('table name is set', () => {
        let client: DynamoClient;

        const updates = {
            services: ['Juggling license', 'Unicorn registration'],
            email: 'name@gov.uk',
            attempts: 10,
            verified: true,
            data: 'Tessa Ting'
        };

        beforeAll(() => {
            process.env.TABLE = "identities";
            client = new DynamoClient();
        });

        it('should generate correct expression attribute names', () => {
            const generatedExpressionAttributeNames = client.generateExpressionAttributeNames(Object.keys(updates));
            const expectedExpressionAttributeNames = {
                '#services': 'services',
                '#email': 'email',
                '#attempts': 'attempts',
                '#verified': 'verified',
                '#D': 'data'
            };

            expect(generatedExpressionAttributeNames).toStrictEqual(expectedExpressionAttributeNames);
        });

        it('should generate correct update expression', () => {
            const updateExpression = client.generateUpdateExpression(Object.keys(updates));
            const expectedUpdateExpression = 'set #services = :services, set #email = :email, set #attempts = :attempts, set #verified = :verified, set #D = :data';

            expect(updateExpression).toEqual(expectedUpdateExpression);
        });

        it('should correctly generate attribute values for an update expression', () => {
            const attributeValues = client.generateExpressionAttributeValues(Object.keys(updates), updates);
            const expectedAttributeValues = {
                ':services': {L: [{S: 'Juggling license'}, {S: 'Unicorn registration'}]},
                ':email': {S: 'name@gov.uk'},
                ':attempts': {N: '10'},
                ':verified': {BOOL: true},
                ':data': {S: 'Tessa Ting'},
            }

            expect(attributeValues).toStrictEqual(expectedAttributeValues);
        });
    });
});
