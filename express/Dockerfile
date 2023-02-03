FROM node:current-alpine
WORKDIR /express

ENV PORT=3000
EXPOSE $PORT

COPY . .
RUN npm install --omit=dev

USER node
CMD COGNITO_CLIENT=StubCognitoClient LAMBDA_FACADE=StubLambdaFacade npm start

HEALTHCHECK CMD wget --spider http://localhost:$PORT
