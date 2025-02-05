import nodeMailer from 'nodemailer';


const transporter = nodeMailer.createTransport({
    host: 'smtp.zoho.eu',
    secure: true,
    port: 465,
    auth: {
        user: process.env.ZOHO_EMAIL_ADDRESS,
        pass: process.env.ZOHO_APP_PASSWORD,
    }
});

export const sendEmailVerification = (toAddress, verificationLink) => {
    const mailOptions = {
        from: `${process.env.ZOHO_EMAIL_FROM_NAME} <${process.env.ZOHO_EMAIL_ADDRESS}>`,
        to: toAddress,
        subject: 'Welcome to Unify Giving!',
        html: `
            <!DOCTYPE html>
            <html lang="en">

                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>Welcome to Unify Giving!</title>
                </head>

                <body>
                    <p>Please click the following link to verify your email address:</p>
                    <a href="${verificationLink}">${verificationLink}</a>
                </body>

            </html>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log(`Email was sent with this verification link: ${verificationLink}`);
        }
    });
};

export const sendEmailResetPassword = (toAddress, password) => {
    const mailOptions = {
        from: `${process.env.ZOHO_EMAIL_FROM_NAME} <${process.env.ZOHO_EMAIL_ADDRESS}>`,
        to: toAddress,
        subject: 'New password Unify Giving!',
        html: `
            <!DOCTYPE html>
            <html lang="en">

                <head>
                    <meta charset="UTF-8">
                    <meta http-equiv="X-UA-Compatible" content="IE=edge">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>New password Unify Giving!</title>
                </head>

                <body>
                    <p>Please change your password on our app.</p>
                    <p>New password:${password}</p>
                </body>

            </html>`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        }
        else {
            console.log(`Email was sent with this new password: ${password}`);
        }
    });
}
