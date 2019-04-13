const Soldiers = require('./soldiers')

const internals = {
  validateId: (_id) => {
    return new Promise((resolve, reject) => {
      if (!_id) {
        return reject(new Error('_id is missing'))
      }
      else if (!(typeof _id === 'string' || _id instanceof String)) {
        return reject(new Error('_id is not a string'))
      }
  
      resolve()
    })
  },

  validateQuery: (query) => {
    return new Promise((resolve, reject) => {
      if (!query) {
        return reject(new Error('Query is missing'))
      }
      else if (!(typeof query === 'object')) {
        return reject(new Error('Query is not an object'))
      }
  
      resolve()
    })
  }
}

module.exports = {
  soldiers: Object.assign(Soldiers, internals)
}