const Http = require('http')
const MongoClient = require('mongodb').MongoClient

const Router = require('./routes')

exports.init = (port, host, dbPath) => {
  return new Promise((resolve, reject) => {
    MongoClient.connect(dbPath)
      .then((db) => {
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
        resolve(server)
      })
      .catch(reject)  
  })
}