const soldierProperties = [ '_id', 'name', 'rank', 'limitations' ]

const internals = {
  checkLimitations: (soldier) => {
    return new Promise((resolve, reject) => {
      if (!soldier.limitations) return resolve()
      
      for (limitation of soldier.limitations) {
        if (!(typeof limitation === 'string' || limitation instanceof String)) {
          return reject(new Error('Soldier limitations are not all strings'))
        }
      }
      resolve()
    })
  },
  checkProperties: (soldier) => {
    return new Promise((resolve, reject) => {
      for (property of Object.keys(soldier)) {
        if (soldierProperties.indexOf(property) === -1) {
          return reject(new Error('Soldier has unfamiliar properties'))
        }
      }
      resolve()
    })
  },
  checkExistence: (collection, soldier) => {
    return new Promise((resolve, reject) => {
      collection.findOne({ _id: soldier._id })
        .then((soldier) => {
          if (soldier) {
            return reject(new Error('Soldier _id already exists'))
          }
          resolve()
        })
        .catch(reject)
    })
  }
}

module.exports = {
  validateSoldier: (collection, soldier) => {
    return new Promise((resolve, reject) => {
      if (!soldier) {
        return reject(new Error('Soldier object is missing'))
      }
      else if (!soldier._id) {
        return reject(new Error('Soldier _id is missing'))
      }
      else if (!(typeof soldier._id === 'string' || soldier._id instanceof String)) {
        return reject(new Error('Soldier _id is not a string'))
      }
      else if (!soldier.name) {
        return reject(new Error('Soldier name is missing'))
      }
      else if (!(typeof soldier.name === 'string' || soldier.name instanceof String)) {
        return reject(new Error('Soldier name is not a string'))
      }
      else if (!soldier.rank) {
        return reject(new Error('Soldier rank is missing'))
      }
      else if (!(typeof soldier.rank === 'string' || soldier.rank instanceof String)) {
        return reject(new Error('Soldier rank is not a string'))
      }
      else if (soldier.limitations && (!(typeof soldier.limitations == 'object') ||
                                       !(soldier.limitations instanceof Array))) {
        return reject(new Error('Soldier limitations is not an array'))
      }

      Promise.all([
          internals.checkLimitations(soldier),
          internals.checkProperties(soldier),
          internals.checkExistence(collection, soldier)
        ])
        .then(resolve)
        .catch(reject)
    })
  }
}