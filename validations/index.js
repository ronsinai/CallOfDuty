const Soldiers = require('./soldiers')

const internals = {
  validateId: async (_id) => {
    if (!_id) {
      throw new Error('_id is missing')
    }
    else if (!(typeof _id === 'string' || _id instanceof String)) {
      throw new Error('_id is not a string')
    }
  },

  validateQuery: async (query) => {
    if (!query) {
      throw new Error('Query is missing')
    }
    else if (!(typeof query === 'object')) {
      throw new Error('Query is not an object')
    }
  }
}

module.exports = {
  soldiers: Object.assign(Soldiers, internals)
}