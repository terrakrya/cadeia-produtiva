const nodemailer = require('nodemailer')

const mailConfig = {
  host: 'mail.privateemail.com',
  port: 587,
  authUser: 'suporte@terrakrya.com',
  authPass: 'pr]))-6[*iUv',
  fromMail: 'suporte@terrakrya.com'
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
