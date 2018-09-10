const SoldiersRouter = require('./soldiers')
const DutiesRouter = require('./duties')
const JusticeBoardRouter = require('./justiceBoard')

function Router (db) {
  this.routes = {
    'soldiers': new SoldiersRouter(db),
    'duties': new DutiesRouter(db),
    'justiceBoard': new JusticeBoardRouter(db)
  }
  
  this.route = (request, response, body) => {
    const pathRoute = request.url.split('/')[1]
    const routeHandler = this.routes[pathRoute.split('?')[0]]
    if (!routeHandler) {
      response.statusCode = 404
      response.end()
      return
    }
  
    if (body) {
      try {
        body = JSON.parse(body)
      }
      catch (err) {
        console.error(err)
        response.stautsCode = 400
        response.end()
        return
      }
    }
  
    routeHandler.route(request, response, body)
  }
}

module.exports = Router