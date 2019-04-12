const Async = require('async')

const soldierProperties = [ '_id', 'name', 'rank', 'limitations' ]

module.exports = {
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
    else if (!soldier.rank) {
      return done(new Error('Soldier rank is missing'))
    }
    else if (!(typeof soldier.rank === 'string' || soldier.rank instanceof String)) {
      return done(new Error('Soldier rank is not a string'))
    }
    else if (soldier.limitations && (!(typeof soldier.limitations == 'object') ||
                                     !(soldier.limitations instanceof Array))) {
      return done(new Error('Soldier limitations is not an array'))
    }

    Async.parallel({
        checkLimitations: (next) => {
          Async.each(
            soldier.limitations,
            (limitation, next) => {
              if (!(typeof limitation === 'string' || limitation instanceof String)) {
                return next(new Error('Soldier limitations are not all strings'))
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
              if (soldierProperties.indexOf(property) === -1) {
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
  }
}