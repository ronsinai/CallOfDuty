const SoldiersRouter = require('./soldiers')

function Router(db) {
  this.routes = {
    'soldiers': new SoldiersRouter(db)
  }
  
  this.route = (request, response, body) => {
    const pathRoute = request.url.split('/')[1]
    const routeHandler = this.routes[pathRoute.split('?')[0]]
    if (!routeHandler) {
      response.statusCode = 404
      return response.end()
    }
  
    if (body) {
      try {
        body = JSON.parse(body)
      }
      catch (err) {
        console.error(err)
        response.stautsCode = 400
        return response.end()
      }
    }
  
    routeHandler.route(request, response, body)
  }
}

module.exports = Router