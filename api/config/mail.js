const nodemailer = require('nodemailer')

const mailConfig = {
  host: 'smtp.mailtrap.io',
  port: 2525,
  authUser: '361304ab1e4376',
  authPass: 'aa81811d087cb6',
  fromMail: 'ranieresantiago@gmail.com',
}

const transporter = nodemailer.createTransport({
  host: mailConfig.host,
  port: mailConfig.port,
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
