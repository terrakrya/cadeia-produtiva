const nodemailer = require('nodemailer')

const mailConfig = {
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  authUser: process.env.SMTP_USER,
  authPass: process.env.SMTP_PASS,
  fromMail: process.env.SMTP_FROM
}

const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
  secure: false,
  auth: {
    user: mailConfig.authUser,
    pass: mailConfig.authPass,
  },
})

export function sendMail(toMail, title, message) {
  const mailOptions = {
    from: mailConfig.fromMail,
    to: toMail,
    subject: title,
    html: message,
  }

  transporter.sendMail(mailOptions, function (error, info) {
    if (error) {
      console.log(error)
    } else {
      console.log('Email sent: ' + info.response)
    }
  })
}
