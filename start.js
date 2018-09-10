const Config = require('./config')
const Index = require('./index')

const PORT = Config.port || 8000
const HOST = Config.host || 'localhost'
const DB = Config.db || 'mongodb://localhost:27017/cod'

Index.init(PORT, HOST, DB, (err, server) => {
  if (err) {
    console.log(`Server start failed.`)
    return
  }
  console.log(`Connected to DB:${DB}.`)
  console.log(`Server running on ${HOST}:${PORT}.`)
})