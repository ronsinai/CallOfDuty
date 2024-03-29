const { port, host, dbPath } = require('./config')
const Index = require('./index')

const PORT = port || 8000
const HOST = host || 'localhost'
const DB_PATH = dbPath || 'mongodb://localhost:27017/cod'

Index.init(PORT, HOST, DB_PATH, (err, server) => {
  if (err) return console.log(`Server start failed.`)

  console.log(`Connected to DB:${DB_PATH}.`)
  console.log(`Server running on ${HOST}:${PORT}.`)
})