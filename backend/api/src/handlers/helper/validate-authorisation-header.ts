export const validateAuthorisationHeader = (
    authHeader: string | undefined
):
    | {
          valid: true;
          userId: string;
      }
    | {
          valid: false;
          errorResponse: {
              statusCode: number;
              body: string;
          };
      } => {
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return {
            valid: false,
            errorResponse: {
                statusCode: 401,
                body: "Missing access token"
            }
        };
    }

    const authToken = authHeader.substring(7);
    //We trust the signature as this token is attached from
    //the frontend which does the validation
    const tokenParts = authToken.split(".");

    if (tokenParts.length !== 3) {
        return {
            valid: false,
            errorResponse: {
                statusCode: 400,
                body: "Invalid access token"
            }
        };
    }

    const encodedPayload = tokenParts[1];
    const decodedPayload = Buffer.from(encodedPayload, "base64url").toString("utf-8");
    const parsedPayload = JSON.parse(decodedPayload);

    const subjectClaim = parsedPayload.sub;

    if (typeof subjectClaim !== "string") {
        return {
            valid: false,
            errorResponse: {
                statusCode: 400,
                body: "Invalid access token"
            }
        };
    }

    return {
        valid: true,
        userId: subjectClaim
    };
};
