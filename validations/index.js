const Duties = require('./duties')
const Soldiers = require('./soldiers')

const internals = {
  validateId: (_id, done) => {
    if (!_id) {
      return done(new Error('_id is missing'))
    }
    else if (!(typeof _id === 'string' || _id instanceof String)) {
      return done(new Error('_id is not a string'))
    }

    done()
  },

  validateQuery: (query, done) => {
    if (!query) {
      return done(new Error('Query is missing'))
    }
    else if (!(typeof query === 'object')) {
      return done(new Error('Query is not an object'))
    }

    done()
  }
}

module.exports = {
  duties: Object.assign(Duties, internals),
  soldiers: Object.assign(Soldiers, internals)
}