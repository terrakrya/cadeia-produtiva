require('../api/database')
const mongoose = require('mongoose')
const User = mongoose.model('User')

const seedUser = async () => {
  let user = await User.findOne({ username: 'admin' })

  if (!user) {
    user = new User()
    user.username = 'admin'
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
