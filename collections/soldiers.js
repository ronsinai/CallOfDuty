const Async = require('async')

const internals = {
  soldierProperties: [ '_id', 'name', 'degree', 'limitations' ],

  validateSoldier: (collection, soldier, done) => {
    if (!soldier) {
      return done(new Error('Soldier object is missing'))
    }
    else if (!soldier._id) {
      return done(new Error('Soldier _id is missing'))
    }
    else if (!(typeof soldier._id === 'string' || soldier._id instanceof String)) {
      return done(new Error('Soldier _id is not a string'))
    }
    else if (!soldier.name) {
      return done(new Error('Soldier name is missing'))
    }
    else if (!(typeof soldier.name === 'string' || soldier.name instanceof String)) {
      return done(new Error('Soldier name is not a string'))
    }
    else if (!soldier.degree) {
      return done(new Error('Soldier degree is missing'))
    }
    else if (!(typeof soldier.degree === 'string' || soldier.degree instanceof String)) {
      return done(new Error('Soldier degree is not a string'))
    }
    else if (!soldier.limitations) {
      soldier.limitations = []
    }

    Async.parallel({
        checkLimitations: (next) => {
          Async.each(
            soldier.limitations,
            (limitation, next) => {
              if (!(typeof limitation === 'string' || limitation instanceof String)) {
                return next(new Error('Soldier limitations are not strings'))
              }
              next()
            },
            next
          )
        },
        checkProperties: (next) => {
          Async.each(
            Object.keys(soldier),
            (property, next) => {
              if (internals.soldierProperties.indexOf(property) === -1) {
                return next(new Error('Soldier has unfamiliar properties'))
              }
              next()
            },
            next
          )
        },
        checkExistence: (next) => {
          collection.findOne({ _id: soldier._id }, (err, result) => {
            if (err) {
              return next(err)
            }
            else if (result) {
              return next(new Error('Soldier _id already exists'))
            }
      
            next()
          })
        }
      }, done
    )
  },

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

function Soldiers (db) {
  this.soldiers = db.collection('soldiers')

  this.insertSoldier = (soldier, done) => {
    internals.validateSoldier(this.soldiers, soldier, (err) => {
      if (err) {
        return done(err)
      }

      this.soldiers.insertOne(soldier, done)
    })
  }

  this.findSoldier = (_id, done) => {
    internals.validateId(_id, (err) => {
      if (err) {
        return done(err)
      }
      
      this.soldiers.findOne({ _id }, done)
    })
  }

  this.findSoldiers = (query, done) => {
    internals.validateQuery(query, (err) => {
      if (err) {
        return done(err)
      }
      
      this.soldiers.find(query).toArray(done)
    })
  }
}

module.exports = Soldiers