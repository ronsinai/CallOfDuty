const Http = require('http')
const MongoClient = require('mongodb').MongoClient

const Router = require('./routes')

exports.init = async (port, host, dbPath) => {
  const db = await MongoClient.connect(dbPath)
  let server = Http.createServer((request, response) => {
    const router = new Router(db)

    const { headers, method, url } = request
    let body = []

    response.on('error', console.error)

    request.on('error', (err) => {
      response.statusCode = 400
      response.end()
    }).on('data', chunk => {
      body.push(chunk)
    }).on('end', () => {
      body = Buffer.concat(body).toString()        
      router.route(request, response, body)
    })
  })

  server.on('error', (err) => {
    console.error(err)
    db.close()
    throw err
  })
  server.on('close', () => db.close())
  
  server = server.listen(port, host)
  return server
}