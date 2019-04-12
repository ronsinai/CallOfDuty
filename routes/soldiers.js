const Url = require('url')

const Soldiers = require('../collections').soldiers

function SoldiersRouter(db) {
  this.soldiers = new Soldiers(db)
  
  this.route = (request, response, body) => {
    switch (request.method) {
      case 'POST':
        this.insertSoldier(request, response, body)
        break
      case 'GET':
        this.findSoldiers(request, response)
        break
      default:
        response.statusCode = 405
        response.end()
    }
  }

  this.insertSoldier = (request, response, body) => {
    const urlParts = request.url.split('/').filter((part) => part !== '')

    if (urlParts.length === 1) {
      this.soldiers.insertSoldier(body, (err) => {
        if (err && err.message === 'Soldier _id already exists') {
          response.statusCode = 409
        }
        else if (err) {
          response.statusCode = 400
        }
        else {
          response.statusCode = 204
        }

        response.end()
      })
      return
    }

    response.statusCode = 404
    response.end()
  }

  this.findSoldiers = (request, response) => {
    const urlParts = request.url.split('/').filter(part => part !== '')

    switch (urlParts.length) {
      case 1:
        const query = Url.parse(request.url, true).query || {}
        this.soldiers.findSoldiers(query, (err, soldiers) => {
          if (err) {
            response.statusCode = 400
          }
          else {
            response.write(JSON.stringify(soldiers))
          }

          response.end()
        })
        break
      case 2:
        this.soldiers.findSoldier(urlParts[1], (err, soldier) => {
          if (err) {
            response.statusCode = 400
          }
          else if (!soldier) {
            response.statusCode = 404
          }
          else {
            response.write(JSON.stringify(soldier))
          }

          response.end()
        })
        break
      default:
        response.statusCode = 404
        response.end()
    }
  }
}

module.exports = SoldiersRouter