const Validations = require('../validations').soldiers

function Soldiers(db) {
  this.soldiers = db.collection('soldiers')

  this.insertSoldier = async (soldier) => {
    await Validations.validateSoldier(this.soldiers, soldier)
    
    if (!soldier.limitations) soldier.limitations = []
    soldier.duties = []
    return await this.soldiers.insertOne(soldier)
  }

  this.findSoldier = async (_id) => {
    await Validations.validateId(_id)
    return await this.soldiers.findOne({ _id })
  }

  this.findSoldiers = async (query) => {
    await Validations.validateQuery(query)
    return await this.soldiers.find(query).toArray()
  }
}

module.exports = Soldiers