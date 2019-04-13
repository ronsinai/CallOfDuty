const { port, host, dbPath } = require('./config')
const Index = require('./index')

const PORT = port || 8000
const HOST = host || 'localhost'
const DB_PATH = dbPath || 'mongodb://localhost:27017/cod'

try {
  await Index.init(PORT, HOST, DB_PATH)
}
catch (err) {
  console.log(`Server start failed.`)
  console.error(err)
}