import {TEST_AWS_REGION, TEST_COGNITO_CLIENT_ID, TEST_COGNITO_USER_POOL_ID} from "./constants";


module.exports = () => {
    process.env.COGNITO_CLIENT_ID = TEST_COGNITO_CLIENT_ID;
    process.env.COGNITO_USER_POOL_ID = TEST_COGNITO_USER_POOL_ID;
    process.env.AWS_REGION = TEST_AWS_REGION;
};
