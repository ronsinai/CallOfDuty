const Validations = require('../validations').soldiers

function Soldiers(db) {
  this.soldiers = db.collection('soldiers')

  this.insertSoldier = (soldier) => {
    return new Promise((resolve, reject) => {
      Validations.validateSoldier(this.soldiers, soldier)
        .then(() => {
          if (!soldier.limitations) soldier.limitations = []
          soldier.duties = []
          return this.soldiers.insertOne(soldier)
        })
        .then(resolve)
        .catch(reject)
    })
  }

  this.findSoldier = (_id) => {
    return new Promise((resolve, reject) => {
      Validations.validateId(_id)
        .then(() => { return this.soldiers.findOne({ _id }) })
        .then(resolve)
        .catch(reject)
    })
  }

  this.findSoldiers = (query) => {
    return new Promise((resolve, reject) => {
      Validations.validateQuery(query)
        .then(() => { return this.soldiers.find(query).toArray() })
        .then(resolve)
        .catch(reject)
    })
  }
}

module.exports = Soldiers