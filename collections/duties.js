const Validations = require('../validations').duties

function Duties(db) {
  this.duties = db.collection('duties')

  this.insertDuty = (duty, done) => {
    Validations.validateDuty(duty, (err) => {
      if (err) return done(err)

      if (!duty.constraints) duty.constraints = []
      duty.soldiers = []
      this.duties.insertOne(duty, done)
    })
  }

  this.findDuty = (_id, done) => {
    Validations.validateId(_id, (err) => {
      if (err) return done(err)
      this.duties.findOne({ _id }, done)
    })
  }

  this.findDuties = (query, done) => {
    Validations.validateQuery(query, (err) => {
      if (err) return done(err)
      this.duties.find(query).toArray(done)
    })
  }

  this.updateDuty = (_id, duty, done) => {
    Validations.validateUpdatedDuty(this.duties, _id, duty, (err) => {
      if (err) return done(err)
      this.duties.updateOne(_id, { $set: duty }, done)
    })
  }

  this.deleteDuty = (_id, done) => {
    Validations.validateDeletedDuty(this.duties, _id, (err) => {
      if (err) return done(err)
      this.duties.remove({ _id }, done)
    })
  }
}

module.exports = Duties