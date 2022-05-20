# Self-Service Experience

To experience the Self-Service Experience, copy, `.env.example`, rename it to `.env` and update the variables with appropriate values.

`npm run build` the first time you need to run the application in order to build the stylesheets and assets.

`gds aws <account> -- npm run dev` if you want it to restart every time you change something
`gds aws <account> -- npm start` if you don't

Set the environment variable `COGNITO_CLIENT` to `StubCognitoClient` to avoid needing AWS credentials.  It's set to that value by default when you run `npm run dev`.