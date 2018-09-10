const Http = require('http')
const MongoClient = require('mongodb').MongoClient

const Router = require('./routes')

exports.init = (port, host, dbPath, done) => {
  MongoClient.connect(dbPath, (err, db) => {
    if (err) {
      console.error(err)
      return done(err)
    }

    const server = Http.createServer((request, response) => {
      const router = new Router(db)

      const { headers, method, url } = request
      let body = []

      response.on('error', console.error)
  
      request.on('error', err => {
        console.error(err)
        response.statusCode = 400
        response.end()
      }).on('data', chunk => {
        body.push(chunk)
      }).on('end', () => {
        body = Buffer.concat(body).toString()        
        router.route(request, response, body)
      })
    })

    server.on('error', console.error)
    server.on('close', () => db.close())
    server.listen(port, host, (err) => {
      if (err) {
        db.close()
        return done(err)
      }
      done(null, server)
    })
  })
}