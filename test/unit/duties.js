const Async = require('async')
const expect = require('chai').expect

const Helper = require('../helper')
const DutiesData = require('../data').duties
const Duties = require('../../collections').duties

const DB = 'mongodb://localhost:27017/cod-test'
const COLLECTION = 'duties'

describe('Duties Collection', () => {
  before((done) => {
    Helper.connectoToDb(DB, (err, db) => {
      if (err) return next(err)

      this.db = db
      this.collection = db.collection(COLLECTION)
      this.duties = new Duties(db)
      done()
    })
  })
  beforeEach((done) => {
    Helper.clearCollection(this.db, COLLECTION, done)
  })

  after((done) => {
    Async.series({
        clearDutiesCollection: (next) => {
          Helper.clearCollection(this.db, COLLECTION, next)
        },
        closeDb: (next) => {
          this.db.close(next)
        }
      }, done
    )
  })

  describe('#insertDuty()', () => {

    it("should return error when duty is missing", (done) => {
      this.duties.insertDuty(undefined, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty object is missing')
        done()
      })
    })
    
    it("should return error when 'name' is missing", (done) => {
      const noName = JSON.parse(JSON.stringify(DutiesData.noName))
      
      this.duties.insertDuty(noName, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty name is missing')
        done()
      })
    })

    it("should return error when 'name' is not a string", (done) => {
      const nameNumber = JSON.parse(JSON.stringify(DutiesData.nameNumber))
      
      this.duties.insertDuty(nameNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty name is not a string')
        done()
      })
    })

    it("should return error when 'location' is missing", (done) => {
      const noLocation = JSON.parse(JSON.stringify(DutiesData.noLocation))
      
      this.duties.insertDuty(noLocation, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty location is missing')
        done()
      })
    })

    it("should return error when 'location' is not a string", (done) => {
      const locationNumber = JSON.parse(JSON.stringify(DutiesData.locationNumber))
      
      this.duties.insertDuty(locationNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty location is not a string')
        done()
      })
    })

    it("should return error when 'days' is missing", (done) => {
      const noDays = JSON.parse(JSON.stringify(DutiesData.noDays))
      
      this.duties.insertDuty(noDays, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty days is missing')
        done()
      })
    })

    it("should return error when 'days' is not an object of 'startDate' and 'endDate', each being an ISODate", (done) => {
      const daysNumber = JSON.parse(JSON.stringify(DutiesData.daysNumber))
      
      this.duties.insertDuty(daysNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty days is not an object')
        done()
      })
    })

    it("should return error when 'soldiersRequired' is missing", (done) => {
      const noSoldiersRequired = JSON.parse(JSON.stringify(DutiesData.noSoldiersRequired))
      
      this.duties.insertDuty(noSoldiersRequired, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty soldiersRequired is missing')
        done()
      })
    })

    it("should return error when 'soldiersRequired' is not a number", (done) => {
      const soldiersRequiredString = JSON.parse(JSON.stringify(DutiesData.soldiersRequiredString))
      
      this.duties.insertDuty(soldiersRequiredString, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty soldiersRequired is not a number')
        done()
      })
    })

    it("should return error when 'value' is missing", (done) => {
      const noValue = JSON.parse(JSON.stringify(DutiesData.noValue))
      
      this.duties.insertDuty(noValue, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty value is missing')
        done()
      })
    })

    it("should return error when 'value' is not a number", (done) => {
      const valueString = JSON.parse(JSON.stringify(DutiesData.valueString))
      
      this.duties.insertDuty(valueString, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty value is not a number')
        done()
      })
    })

    it("should return error when 'constraints' is not an array", (done) => {
      const constraintsString = JSON.parse(JSON.stringify(DutiesData.constraintsString))
      
      this.duties.insertDuty(constraintsString, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty constraints is not an array')
        done()
      })
    })

    it("should return error when 'constraints' is not an array of strings", (done) => {
      const constraintsNumber = JSON.parse(JSON.stringify(DutiesData.constraintsNumber))
      
      this.duties.insertDuty(constraintsNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty constraints are not all strings')
        done()
      })
    })
    
    it("should return error when duty has unfamiliar properties", (done) => {
      const unfamiliarProperties = JSON.parse(JSON.stringify(DutiesData.unfamiliarProperties))
      
      this.duties.insertDuty(unfamiliarProperties, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Duty has unfamiliar properties')
        done()
      })
    })

    it("should successfully insert a proper duty", (done) => {
      const duty = JSON.parse(JSON.stringify(DutiesData.properDuties[0]))
      const originalDuty = JSON.parse(JSON.stringify(duty))
      const desiredDuty = JSON.parse(JSON.stringify(duty))
      desiredDuty.soldiers = []

      Async.series({
          insertDuty: (next) => {
            this.duties.insertDuty(duty, next)
          },
          getDuty: (next) => {
            this.collection.findOne(originalDuty, (err, dbDuty) => {
              expect(err).to.not.exist
              expect(dbDuty).to.exist
              delete dbDuty._id
              expect(JSON.stringify(dbDuty)).to.equal(JSON.stringify(desiredDuty))
              done()
            })
          }
        }, done
      )
    })

    it("should initialize 'constraints' to an empty array when missing", (done) => {
      const duty = DutiesData.noConstraints
      const desiredDuty = JSON.parse(JSON.stringify(duty))
      desiredDuty.constraints = []
      desiredDuty.soldiers = []
      const originalDuty = JSON.parse(JSON.stringify(duty))

      Async.series({
          insertDuty: (next) => {
            this.duties.insertDuty(duty, next)
          },
          getDuty: (next) => {
            this.collection.findOne(originalDuty, (err, dbDuty) => {
              expect(err).to.not.exist
              expect(dbDuty).to.exist
              delete dbDuty._id
              expect(JSON.stringify(dbDuty)).to.equal(JSON.stringify(desiredDuty))              
              done()
            })
          }
        }, done
      )
    })
  })
})