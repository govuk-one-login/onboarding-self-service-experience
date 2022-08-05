import '../../src/client/DynamoClient'
import DynamoClient from "../../src/client/DynamoClient";

describe('DynamoClient tests', function () {
        it('does what Karol expects it to', function () {
            let client = new DynamoClient("foo");
            let attributeNames = {"foo": "foobar", "bar": "barbar"};
            console.log(client.generateUpdateExpression(attributeNames));
        });

        it('prints some output', function() {
            let client = new DynamoClient("foo");
            let attributes = ["foo", "bar", "data", "baz"];
            console.log(JSON.stringify(client.generateExpressionAttributeNames(attributes)));
        })

        it('prints some more output', function() {
            let update = {foo: "foobar", bar: "barbar", baz: "bazbar"}
            let client = new DynamoClient("foo");
            console.log(JSON.stringify(client.generateExpressionAttributeValues(Object.keys(update), update)));
            console.log(JSON.stringify(client.generateExpressionAttributeValuesNew(Object.keys(update), update)));

        })
    }
)