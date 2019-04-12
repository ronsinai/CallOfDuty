const Validations = require('../validations').soldiers

function Soldiers(db) {
  this.soldiers = db.collection('soldiers')

  this.insertSoldier = (soldier, done) => {
    Validations.validateSoldier(this.soldiers, soldier, (err) => {
      if (err) return done(err)

      if (!soldier.limitations) soldier.limitations = []
      soldier.duties = []
      this.soldiers.insertOne(soldier, done)
    })
  }

  this.findSoldier = (_id, done) => {
    Validations.validateId(_id, (err) => {
      if (err) return done(err)
      this.soldiers.findOne({ _id }, done)
    })
  }

  this.findSoldiers = (query, done) => {
    Validations.validateQuery(query, (err) => {
      if (err) return done(err)
      this.soldiers.find(query).toArray(done)
    })
  }
}

module.exports = Soldiers