const Async = require('async')
const expect = require('chai').expect

const DB = 'mongodb://localhost:27017/cod-test'
const helper = require('../helper')
const Duties = require('../../collections').duties

describe('Duties Collection', () => {
  let db = null,
      duties = null

  before(done => {
    helper.connectoToDb(DB, (err, database) => {
      if (err) {
        return next(err)
      }

      db = database
      duties = new Duties(db)
      done()
    })
  })
  beforeEach(done => {
    helper.clearCollection(db, 'duties', done)
  })

  after(done => {
    Async.series({
        clearDutiesCollection: (next) => {
          helper.clearCollection(db, 'duties', next)
        },
        closeDb: (next) => {
          db.close(next)
        }
      }, done
    )
  })

  describe('#insertDuty()', () => {
    it("should return error when duty is missing")
    it("should return error when 'id' is missing")
    it("should return error when 'id' already exists")
    it("should return error when 'id' is not a string")
    it("should return error when 'name' is missing")
    it("should return error when 'name' is not a string")
    it("should return error when 'location' is missing")
    it("should return error when 'location' is not a string")
    it("should return error when 'days' is missing")
    it("should return error when 'days' is not an object of 'startDate' and 'endDate', each being an ISODate")
    it("should return error when 'soldiersRequired' is missing")
    it("should return error when 'soldiersRequired' is not a number")
    it("should return error when 'value' is missing")
    it("should return error when 'value' is not a number")
    it("should return error when 'name' is not a string")
    it("should return error when 'constraints' is not an array of strings")
    it("should return error when duty has undesired properties")
    it("should successfully insert a proper duty")
    it("should initialize 'constraints' to an empty array when missing")
  })
})