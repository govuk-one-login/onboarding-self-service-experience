# dynamo-api

Basic API Gateway stack based on one of the sam-cli starters put tweaked to use TypeScript instead of JavaScript.

The out of the box functionality provides a GetAllItems [GET], GetItemById [GET] and PutItem [POST] endpoint which do what they say on the tin.

`sam build --beta-features # the typescript building is the beta-feature`
`gds aws <your account> -- sam deploy --guided`

Then call the WebEndpoint Output for you at the end of deploy.  You should see [].

To add an item `curl -X POST --data '{"id": "123", "name": "paul"}' https://theendpoint`

To retrieve the item `curl https://theendpoint/123`

Next steps we'll secure the API using a Cognito Userpool API (I think).

Then we'll do some useful dynamo related stuff and not just adding pointless id/name pairs.  The current lambdas will inevitably be removed but it's nice to have something we can call from the frontend at the moment.
