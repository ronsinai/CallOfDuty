const Duties = require('../collections').duties

function DutiesRouter (db) {
  this.duties = new Duties(db)
  
  this.route = (request, response, body) => {
    response.end()
  }
}

module.exports = DutiesRouter