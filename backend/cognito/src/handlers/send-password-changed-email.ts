import {PostConfirmationConfirmForgotPassword} from "aws-lambda";
import {createTransport, SentMessageInfo} from "nodemailer";

const smtpServer = "email-smtp.eu-west-2.amazonaws.com";
const smtpPort = 587;
const userName = "ses-smtp-cognito-user";
const password = "AKIAXGK3QJNXSXFITJ7P";

const smtpTransporter = createTransport({
    host: smtpServer,
    port: smtpPort,
    secure: true, // true for 465, false for other ports
    auth: {
        user: userName,
        pass: password
/*
        user: process.env.AWS_ACCESS_KEY_ID,
        pass: process.env.AWS_SECRET_ACCESS_KEY
*/
    },
    debug: true
});

exports.handler = async (event: PostConfirmationConfirmForgotPassword): Promise<PostConfirmationConfirmForgotPassword> => {
    const toAddress = event.request.clientMetadata?.email;

    if (!toAddress) {
        throw new Error("Destination email address is missing from the event");
    }

    console.log("ConfirmForgotPasswordEmailHandler:handler :: sending email to: ", toAddress);
    await run(toAddress, doneMethod);
    return event;
};

function doneMethod(error: Error | null, info: SentMessageInfo) {
    if (error) {
        console.log("PostConfirmationConfirmForgotPassword returned with error: " + JSON.stringify(error));
        throw error;
    }

    console.log("PostConfirmationConfirmForgotPassword returned ok: " + JSON.stringify(info));
}

async function run(toAddress: string, callback: (err: Error | null, info: SentMessageInfo) => void) {
    const fromAddress = process.env.FROM_ADDRESS as string;
    console.debug("ConfirmForgotPasswordEmailHandler:run :: toAddress: ", toAddress);
    const body = generateEmailBody();

    const done = (err: Error, res: SentMessageInfo) =>
        callback(null, {
            statusCode: err ? "400" : "200",
            body: err ? err.message : JSON.stringify(res),
            headers: {
                "Content-Type": "application/json",
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "POST"
            }
        });

    const mailOptions = {
        from: "GOV.UK One Login <".concat(fromAddress).concat(">"),
        to: toAddress,
        subject: "Your password has been changed for the GOV.UK One Login admin tool",
        text: body
    };

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    smtpTransporter.sendMail(mailOptions, done(null, body));

    console.debug("ConfirmForgotPasswordEmailHandler:run :: completed");
}

function generateEmailBody() {
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
                                                <a href="https://www.gov.uk" title="Go to the GOV.UK homepage" style="text-decoration:none" target="_blank" data-saferedirecturl="https://www.google.com/url?q=https://www.gov.uk&amp;source=gmail&amp;ust=1655759894745000&amp;usg=AOvVaw3YX7ZnOa7uia318p4Azv4u">
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
                          "> One Login <strong style="display: inline-block;
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
                        <p class="norrmal-text">Your password for the GOV.UK One Login admin tool has been changed.</p>
                        <p class="norrmal-text">If you did not do this, contact us: <a style="word-wrap:break-word;color:#1d70b8" href="https://www.sign-in.service.gov.uk/contact-us?adminTool" target="_blank" data-saferedirecturl="GOV.UK">https://www.sign-in.service.gov.uk/contact-us?adminTool</a></p>
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
