const nodemailer = require('nodemailer');

type Options = {
  to: string;
  subject: string;
  message: string;
};

export default async function (options: Options) {
  // 1) Create a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USERNAME!,
      pass: process.env.EMAIL_PASSWORD!,
    },
  });

  // 2) Create email options
  const emailOptions = {
    to: options.to,
    text: options.message,
    subject: options.subject,
    from: 'AirBnBWannabe <AirBnBWannabe@company.io>',
  };

  // 3) Actually send the email
  await transporter.sendMail(emailOptions);
}
