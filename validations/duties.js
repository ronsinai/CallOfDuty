const Async = require('async')

const dutyProperties = [ 'name', 'location', 'days', 'soldiersRequired', 'value', 'constraints' ]

const internals = {
  checkConstraints: (constraints, done) => {
    Async.each(
      constraints,
      (constraint, next) => {
        if (!(typeof constraint === 'string' || constraint instanceof String)) {
          return next(new Error('Duty constraints are not all strings'))
        }
        next()
      },
      done
    )
  },

  checkProperties: (duty, done) => {
    Async.each(
      Object.keys(duty),
      (property, next) => {
        if (dutyProperties.indexOf(property) === -1) {
          return next(new Error('Duty has unfamiliar properties'))
        }
        next()
      },
      done
    )
  },

  checkScheduled: (collection, _id, done) => {
    collection.findOne({ _id }, (err, result) => {
      if (err) {
        return done(err)
      }
      else if (result && result.soldiers.length > 0) {
        return done(new Error('Scheduled duty cannot be changed'))
      }

      done()
    })
  }
}

module.exports = {
  validateDuty: (duty, done) => {
    if (!duty) {
      return done(new Error('Duty object is missing'))
    }
    else if (!duty.name) {
      return done(new Error('Duty name is missing'))
    }
    else if (!(typeof duty.name === 'string' || duty.name instanceof String)) {
      return done(new Error('Duty name is not a string'))
    }
    else if (!duty.location) {
      return done(new Error('Duty location is missing'))
    }
    else if (!(typeof duty.location === 'string' || duty.location instanceof String)) {
      return done(new Error('Duty location is not a string'))
    }
    else if (!duty.days) {
      return done(new Error('Duty days is missing'))
    }
    else if (!(typeof duty.days === 'object' || duty.days instanceof Object)) {
      return done(new Error('Duty days is not an object'))
    }
    else if (!duty.days.start || (new Date(duty.days.start) === 'Invalid Date') ||
             !duty.days.end || (new Date(duty.days.end) === 'Invalid Date')) {
      return done(new Error('Duty days format is incorrect'))
    }
    else if (!duty.soldiersRequired) {
      return done(new Error('Duty soldiersRequired is missing'))
    }
    else if (!(typeof duty.soldiersRequired === 'number')) {
      return done(new Error('Duty soldiersRequired is not a number'))
    }
    else if (!duty.value) {
      return done(new Error('Duty value is missing'))
    }
    else if (!(typeof duty.value === 'number')) {
      return done(new Error('Duty value is not a number'))
    }
    else if (duty.constraints && (!(typeof duty.constraints == 'object') ||
                                     !(duty.constraints instanceof Array))) {
      return done(new Error('Duty constraints is not an array'))
    }

    Async.parallel({
        checkConstraints: (next) => internals.checkConstraints(duty.constraints, next),
        checkProperties: (next) => internals.checkProperties(duty, next)
      }, done
    )
  },

  validateUpdatedDuty: (collection, _id, duty, done) => {
    if (duty._id && duty._id !== _id) {
      return done(new Error('Duty id cannot be updated'))
    }
    else if (duty.name && !(typeof duty.name === 'string' || duty.name instanceof String)) {
      return done(new Error('Duty name is not a string'))
    }
    else if (duty.location && !(typeof duty.location === 'string' || duty.location instanceof String)) {
      return done(new Error('Duty location is not a string'))
    }
    else if (duty.days && !(typeof duty.days === 'object' || duty.days instanceof Object)) {
      return done(new Error('Duty days is not an object'))
    }
    else if (duty.days &&
            !duty.days.start || (new Date(duty.days.start) === 'Invalid Date') ||
            !duty.days.end || (new Date(duty.days.end) === 'Invalid Date')) {
      return done(new Error('Duty days format is incorrect'))
    }
    else if (duty.soldiersRequired && !(typeof duty.soldiersRequired === Number)) {
      return done(new Error('Duty soldiersRequired is not a number'))
    }
    else if (duty.value && !(typeof duty.value === Number)) {
      return done(new Error('Duty value is not a number'))
    }
    else if (duty.constraints && (!(typeof duty.constraints == 'object') ||
                                     !(duty.constraints instanceof Array))) {
      return done(new Error('Duty constraints is not an array'))
    }

    Async.parallel({
        checkConstraints: (next) => internals.checkConstraints(duty.constraints, next),
        checkProperties: (next) => internals.checkProperties(duty, next),
        checkScheduledDuty: (next) => internals.checkScheduled(collection, _id, next)
      }, done
    )
  },

  validateDeletedDuty: (collection, _id, done) => {
    internals.checkScheduled(collection, _id, done)
  }
}