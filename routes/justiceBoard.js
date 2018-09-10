const JusticeBoard = require('../helpers').justiceBoard

function JusticeBoardRouter (db) {
  this.justiceBoard = new JusticeBoard(db)
  
  this.route = (request, response, body) => {
    response.end()
  }
}

module.exports = JusticeBoardRouter