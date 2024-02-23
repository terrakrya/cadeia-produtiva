require('../api/database')
const mongoose = require('mongoose')
const User = mongoose.model('User')

const migrateDocuments = async () => {
  const users = await User.find({ cellphone: null })

  for (const user of users) {
    const oldUsername = user.username
    const newUsername = user.cpf.replace(/\D/g, '')

    await user.updateOne({
      $set: { username: newUsername, cellphone: oldUsername },
    })
  }
}

const migrateCellphoneUsername = async () => {
  console.log('migrateCellphoneUsername') // eslint-disable-line
  await migrateDocuments()
  console.log('migrateCellphoneUsername finished') // eslint-disable-line
  process.exit()
}

migrateCellphoneUsername()
