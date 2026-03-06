const nodemailer = require('nodemailer');
//new Email(user, url).sendWelcome();

module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.firstName = user.name.split(' ')[0];
    this.url = url;
    this.from = `Malaika Malik <${process.env.EMAIL_FROM}>`;
  }

  createTransport() {
    if (process.env.NODE_ENV === 'production') {
      // sendgrid
      return 1;
    }
    return nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD,
      },
      // activate in gmail 'less secure app' option
    });
  }

  // send the actual email
  send(template, subject) {
    // 1) render html based ona pug template
    res.render('');
    // 2) define the email options
    const mailOptions = {
      from: 'Malaika Malik <malaika@2003.io>',
      to: options.email,
      subject: options.subject,
      text: options.text,
      //html:
    };
    // 3) create a transport and send email
  }
  sendWelcome() {
    this.send('welcome', 'Welcome to the Natours Family');
  }
};
const sendEmail = async (options) => {
  // 1) create a transporter is a service

  // activate in gmail 'less secure app' option

  // 2) define email options
  const mailOptions = {
    from: 'Malaika Malik <malaika@2003.io>',
    to: options.email,
    subject: options.subject,
    text: options.text,
    //html:
  };
  // 3) actually send the email
  //await transporter.sendMail(mailOptions);
};
