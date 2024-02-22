require('../api/database')
const mongoose = require('mongoose')
const User = mongoose.model('User')

const seedUser = async () => {
  let user = await User.findOne({ username: '12345890110' })

  if (!user) {
    user = new User()
    user.username = '12345890110'
    user.cpf = '123.458.901-10'
    user.cellphone = '11944484992'
    user.email = 'admin@terrakrya.com'
    user.name = 'admin'
    user.nickname = 'admin'
    user.role = 'admin'
    user.setPassword('MUDESUASENHA')

    console.log('User updated') // eslint-disable-line
    await user.save()
  }
}

// padrão para os "seeds"
const seed = async () => {
  console.log('User seed') // eslint-disable-line
  await seedUser()
  console.log('User seed finished') // eslint-disable-line
  process.exit()
}

seed()
