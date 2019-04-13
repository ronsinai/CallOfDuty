const soldierProperties = [ '_id', 'name', 'rank', 'limitations' ]

const internals = {
  checkLimitations: async (soldier) => {
    if (!soldier.limitations) return
    
    for (limitation of soldier.limitations) {
      if (!(typeof limitation === 'string' || limitation instanceof String)) {
        throw new Error('Soldier limitations are not all strings')
      }
    }
  },
  checkProperties: async (soldier) => {
    for (property of Object.keys(soldier)) {
      if (soldierProperties.indexOf(property) === -1) {
        throw new Error('Soldier has unfamiliar properties')
      }
    }
  },
  checkExistence: async (collection, soldier) => {
    const dbSoldier = await collection.findOne({ _id: soldier._id })
    if (dbSoldier) {
      throw new Error('Soldier _id already exists')
    }
  }
}

module.exports = {
  validateSoldier: async (collection, soldier) => {
    if (!soldier) {
      throw new Error('Soldier object is missing')
    }
    else if (!soldier._id) {
      throw new Error('Soldier _id is missing')
    }
    else if (!(typeof soldier._id === 'string' || soldier._id instanceof String)) {
      throw new Error('Soldier _id is not a string')
    }
    else if (!soldier.name) {
      throw new Error('Soldier name is missing')
    }
    else if (!(typeof soldier.name === 'string' || soldier.name instanceof String)) {
      throw new Error('Soldier name is not a string')
    }
    else if (!soldier.rank) {
      throw new Error('Soldier rank is missing')
    }
    else if (!(typeof soldier.rank === 'string' || soldier.rank instanceof String)) {
      throw new Error('Soldier rank is not a string')
    }
    else if (soldier.limitations && (!(typeof soldier.limitations == 'object') ||
                                      !(soldier.limitations instanceof Array))) {
      throw new Error('Soldier limitations is not an array')
    }

    return await Promise.all([
        internals.checkLimitations(soldier),
        internals.checkProperties(soldier),
        internals.checkExistence(collection, soldier)
      ])
  }
}