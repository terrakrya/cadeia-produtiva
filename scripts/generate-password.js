const crypto = require('crypto')

const generate = async () => {
  const password = process.argv.length == 3 ? process.argv[2] : '123'
  console.log('Generating password "' +password+ '"') // eslint-disable-line

  const salt = crypto.randomBytes(16).toString('hex')
  const hash = crypto.pbkdf2Sync(password, salt, 10000, 512, 'sha512').toString('hex')
  console.log('Salt: ' + salt) // eslint-disable-line
  console.log('Hash: ' + hash) // eslint-disable-line

  process.exit()
}

generate()
