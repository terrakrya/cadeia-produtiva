require('../api/database')
const regiao = require('../data/regioes-castanheiras.json')

const mongoose = require('mongoose')
const User = mongoose.model('User')

const migrateDocuments = async () => {
  const users = await User.find({ region: null })

  for (const user of users) {
    const [regiaoUser] = regiao.filter(function (item) {
      return item.municipio === user.city
    })

    if (regiaoUser) {
      await user.updateOne({
        $set: { region: regiaoUser.regiaoCastanheira },
      })
    }
  }
}

const migrateRegiaoesCastanheiras = async () => {
  console.log('migrateRegiaoesCastanheiras') // eslint-disable-line
  await migrateDocuments()
  console.log('migrateRegiaoesCastanheiras finished') // eslint-disable-line
  process.exit()
}

migrateRegiaoesCastanheiras()
