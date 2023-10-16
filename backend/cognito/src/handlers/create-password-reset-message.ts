import {CustomMessageForgotPasswordTriggerEvent} from "aws-lambda";

export const handler = async (event: CustomMessageForgotPasswordTriggerEvent): Promise<CustomMessageForgotPasswordTriggerEvent> => {
    return event.triggerSource === "CustomMessage_ForgotPassword" ? forgotPassword(event) : event;
};

async function forgotPassword(event: CustomMessageForgotPasswordTriggerEvent): Promise<CustomMessageForgotPasswordTriggerEvent> {
    const clientMetadata = event.request.clientMetadata;

    if (!clientMetadata) {
        throw new Error("Client metadata is missing from the event");
    }

    const code = event.request.codeParameter;
    const username = encodeURIComponent(clientMetadata.username);
    const link = `${clientMetadata.protocol}://${clientMetadata.host
        .split("/")
        .join("")}/sign-in/forgot-password/create-new-password?loginName=${username}&confirmationCode=${code}`;

    event.response = {
        smsMessage: "",
        emailSubject: "Reset your password for GOV.UK One Login",
        emailMessage: generateEmailBody(link)
    };

    return event;
}

function generateEmailBody(emailBody: string) {
    return `
    <html>
        <body>
            <head>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <style>
        body {
            -webkit-font-smoothing: antialiased;
            margin: 0;
            padding: 0;
            -ms-text-size-adjust: 100%;
            -webkit-text-size-adjust: 100%;
            font-family: Arial;
            font-size: 18px;
            font-weight: 700;
            line-height: 26px;
            letter-spacing: 0px;
            text-align: left;
        }

        .bold-text {
            font-family: Arial;
            font-size: 18px;
            font-weight: 700;
            line-height: 26px;
            letter-spacing: 0px;
            text-align: left;
            color: black;
        }

        .norrmal-text {
            font-family: Arial;
            font-size: 18px;
            font-weight: 400;
            line-height: 26px;
            letter-spacing: 0px;
            text-align: left;
            color: black;
        }

        .body {
            background-color: #white;
            width: 100%;
        }

        .wrapper {
            box-sizing: border-box;
            padding: 10px;
        }
    </style>
</head>
            
            <table role="presentation" border="0" cellpadding="0" cellspacing="0" class="body">
    <!--MAIN CONTENT AREA -->
    <tr>
        <td class="wrapper">
            <table role="presentation" border="0" cellpadding="0" cellspacing="0">
                <tr>
                    <td>
                        <table role="presentation" width="100%" style="border-collapse:collapse;min-width:100%;width:100%!important" cellpadding="0" cellspacing="0" border="0">
                            <tbody>
                            <tr>
                                <td width="100%" height="53" bgcolor="#0b0c0c">
                                    <table role="presentation" width="100%" style="border-collapse:collapse;max-width:580px" cellpadding="0" cellspacing="0" border="0" align="left">
                                        <tbody>
                                        <tr>
                                            <td width="70" bgcolor="#0b0c0c" valign="middle">
                                                <a href="https://admin.sign-in.service.gov.uk/services" title="Go to GOV.UK One Login Admin Tool services" style="text-decoration:none" target="_blank">
                                                    <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="border-collapse:collapse">
                                                        <tbody>
                                                        <tr>
                                                            <td style="padding-left:10px">
                                                                <img src="https://ci4.googleusercontent.com/proxy/pvN1p4x4E1j9aX5roof_HW0YpKqWW5iSOZzXLTlAyx0NPYGuqBupZFadY3FPEYjc00W_X_99tYW-5-3Y52Si7-xReAOZTsXAcfafeDRvFFZS_xQvOBKajCUR5L0fvA8=s0-d-e1-ft#https://static.notifications.service.gov.uk/images/gov.uk_logotype_crown.png" alt="" height="32" border="0" style="Margin-top:4px" class="CToWUd">
                                                            </td>
                                                            <td style="font-size:28px;line-height:1.315789474;Margin-top:4px;padding-left:10px">
                                                                <span style="font-family:Arial,sans-serif;font-weight:700;color:#ffffff;text-decoration:none;vertical-align:top;display:inline-block">GOV.UK</span>
                                                                <span style="font-family: arial, sans-serif; -webkit-font-smoothing: antialiased;
                          -moz-osx-font-smoothing: grayscale;
                          display: inline-table;
                          font-style: normal;
                          font-weight: 400;
                          font-size: 24px;
                          line-height: 32px;
                          color: white;
                          "> One Login admin tool <strong style="display: inline-block;
                              outline: 2px solid transparent;
                              outline-offset: -2px;
                              color: #ffffff;
                              background-color: #1d70b8;
                              letter-spacing: 1px;
                              text-decoration: none;
                              text-transform: uppercase;
                              font-family: arial, sans-serif;
                              -webkit-font-smoothing: antialiased;
                              -moz-osx-font-smoothing: grayscale;
                              padding-top: 5px;
                              padding-right: 8px;
                              padding-bottom: 4px;
                              padding-left: 8px;
                              font-style: normal;
                              font-weight: 700;
                              font-size: 16px;
                              line-height: 16px;
                              letter-spacing: 1px;
                              text-transform: uppercase;"> beta </strong>
                                                  </span>
                                                            </td>
                                                        </tr>
                                                        </tbody>
                                                    </table>
                                                </a>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <div style="margin-top: 40px;"></div>
                        <p class="norrmal-text">We received a request to reset your password for GOV.UK One Login.</p>
                        <p class="norrmal-text">Reset your password at</p>
                        <p class="bold-text"><a style="word-wrap:break-word;color:#1d70b8" href="${emailBody}" target="_blank" data-saferedirecturl="GOV.UK">${emailBody}</a></p>
                        <p class="norrmal-text">The link will expire after 15 minutes.</p>
                        <p class="norrmal-text">If you did not use this email you can ignore it - your password has not been changed.</p>
                        <p class="norrmal-text">Thanks,</p>
                        <p class="norrmal-text">The GOV.UK One Login team</p>
                    </td>
                </tr>
            </table>
        </td>
    </tr>
</table>
        </body>
    </html>
`;
}
