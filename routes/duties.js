const Duties = require('../collections').duties

function DutiesRouter(db) {
  this.duties = new Duties(db)
  
  this.route = (request, response, body) => {
    switch (request.method) {
      case 'POST':
        this.insertDuty(request, response, body)
        break
      case 'GET':
        this.findDuties(request, response)
        break
      case 'PUT':
        this.updateDuty(request, response)
        break
      case 'DELETE':
        this.deleteDuty(request, response)
        break
      default:
        response.statusCode = 405
        response.end()
    }
  }

  this.insertDuty = (request, response, body) => {
    const urlParts = request.url.split('/').filter((part) => part !== '')

    if (urlParts.length === 1) {
      this.duties.insertDuty(body, (err) => {
        if (err && err.message === 'Duty _id already exists') {
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

  this.findDuties = (request, response) => {
    const urlParts = request.url.split('/').filter(part => part !== '')

    switch (urlParts.length) {
      case 1:
        const query = Url.parse(request.url, true).query
        this.duties.findDuties(query, (err, duties) => {
          if (err) {
            response.statusCode = 400
          }
          else {
            response.write(JSON.stringify(duties))
          }

          response.end()
        })
        break
      case 2:
        this.duties.findDuty(urlParts[1], (err, duty) => {
          if (err) {
            response.statusCode = 400
          }
          else if (!duty) {
            response.statusCode = 404
          }
          else {
            response.write(JSON.stringify(duty))
          }

          response.end()
        })
        break
      default:
        response.statusCode = 404
        response.end()
    }
  }

  this.updateDuty = (request, response, body) => {
    const urlParts = request.url.split('/').filter((part) => part !== '')

    if (urlParts.length === 2) {
      this.duties.updateDuty(body, (err) => {
        if (err) {
          response.statusCode = 400
        }
        else {
          response.statusCode = 204
        }

        return response.end()
      })
    }

    response.statusCode = 404
    response.end()
  }

  this.deleteDuty = (request, response) => {
    const urlParts = request.url.split('/').filter((part) => part !== '')

    if (urlParts.length === 2) {
      this.duties.deleteDuty(urlParts[1], (err) => {
        if (err) {
          response.statusCode = 400
        }

        return response.end()
      })
    }

    response.statusCode = 404
    response.end()
  }
}

module.exports = DutiesRouter