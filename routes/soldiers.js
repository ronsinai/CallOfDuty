const Url = require('url')

const Soldiers = require('../collections').soldiers

function SoldiersRouter(db) {
  this.soldiers = new Soldiers(db)
  
  this.route = async (request, response, body) => {
    switch (request.method) {
      case 'POST':
        return await this.insertSoldier(request, response, body)
      case 'GET':
        return await this.findSoldiers(request, response)
      default:
        response.statusCode = 405
        response.end()
    }
  }

  this.insertSoldier = async (request, response, body) => {
    const urlParts = request.url.split('/').filter((part) => part !== '')

    if (urlParts.length === 1) {
      try {
        await this.soldiers.insertSoldier(body)
        response.statusCode = 204
      }
      catch (err) {
        if (err && err.message === 'Soldier _id already exists') {
          response.statusCode = 409
        }
        else {
          response.statusCode = 400
        }
        response.end()
      }
      return response.end()
    }

    response.statusCode = 404
    response.end()
  }

  this.findSoldiers = async (request, response) => {
    const urlParts = request.url.split('/').filter(part => part !== '')

    switch (urlParts.length) {
      case 1:
        const query = Url.parse(request.url, true).query || {}

        try {
          const soldiers = await this.soldiers.findSoldiers(query)
          response.write(JSON.stringify(soldiers))
        }
        catch (err) {
          response.statusCode = 400
        }
        return response.end()
      case 2:
        try {
          const soldier = await this.soldiers.findSoldier(urlParts[1])
          if (!soldier) response.statusCode = 404
          else response.write(JSON.stringify(soldier))
        }
        catch (err) {
          response.statusCode = 400
        }
        return response.end()
      default:
        response.statusCode = 404
        response.end()
    }
  }
}

module.exports = SoldiersRouter