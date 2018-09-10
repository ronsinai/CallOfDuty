const Async = require('async')
const expect = require('chai').expect

const Helper = require('../helper')
const SoldiersData = require('../data').soldiers
const Soldiers = require('../../collections').soldiers

const DB = 'mongodb://localhost:27017/cod-test'

describe('Soldiers Collection', () => {
  before((done) => {
    Helper.connectoToDb(DB, (err, db) => {
      if (err) {
        return next(err)
      }

      this.db = db
      this.soldiers = new Soldiers(db)
      done()
    })
  })
  beforeEach((done) => {
    Helper.clearCollection(this.db, 'soldiers', done)
  })

  after((done) => {
    Async.series({
        clearSoldiersCollection: (next) => {
          Helper.clearCollection(this.db, 'soldiers', next)
        },
        closeDb: (next) => {
          this.db.close(next)
        }
      }, done
    )
  })

  describe('#insertSoldier()', () => {

    it("should return error when soldier is missing", (done) => {
      this.soldiers.insertSoldier(undefined, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier object is missing')
        done()
      })
    })

    it("should return error when '_id' is missing", (done) => {
      this.soldiers.insertSoldier(SoldiersData.noId, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier _id is missing')
        done()
      })
    })
    
    it("should return error when '_id' already exists", (done) => {
      Async.series({
          insertFirstSoldier: (next) => {
            this.db.collection('soldiers').insertOne(SoldiersData.sameId[0], next)
          },
          insertSoldierWithSameId: next => {
            this.soldiers.insertSoldier(SoldiersData.sameId[1], (err) => {
              expect(err).to.exist
              expect(err.message).to.equal('Soldier _id already exists')
              next()
            })
          }
        }, done
      )
    })

    it("should return error when '_id' is not a string", (done) => {
      this.soldiers.insertSoldier(SoldiersData.idNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier _id is not a string')
        done()
      })
    })
    
    it("should return error when 'name' is missing", (done) => {
      this.soldiers.insertSoldier(SoldiersData.noName, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier name is missing')
        done()
      })
    })

    it("should return error when 'name' is not a string", (done) => {
      this.soldiers.insertSoldier(SoldiersData.nameNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier name is not a string')
        done()
      })
    })

    it("should return error when 'degree' is missing", (done) => {
      this.soldiers.insertSoldier(SoldiersData.noDegree, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier degree is missing')
        done()
      })
    })

    it("should return error when 'degree' is not a string", (done) => {
      this.soldiers.insertSoldier(SoldiersData.degreeNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier degree is not a string')
        done()
      })
    })

    it("should return error when 'limitations' is not an array of strings", (done) => {
      this.soldiers.insertSoldier(SoldiersData.limitationsNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier limitations are not strings')
        done()
      })
    })
    
    it("should return error when soldier has unfamiliar properties", (done) => {
      this.soldiers.insertSoldier(SoldiersData.unfamiliarProperties, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier has unfamiliar properties')
        done()
      })
    })

    it("should successfully insert a proper soldier", (done) => {
      const soldier = SoldiersData.properSoldiers[0]

      Async.series({
          insertSoldier: (next) => {
            this.soldiers.insertSoldier(soldier, next)
          },
          getSoldier: (next) => {
            this.db.collection('soldiers').findOne(soldier, (err, dbSoldier) => {
              expect(err).to.not.exist
              expect(dbSoldier).to.exist
              expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(soldier))
              done()
            })
          }
        }, done
      )
    })

    it("should initialize 'limitations' to an empty array when missing", (done) => {
      const originalSoldier = SoldiersData.noLimitations
      const desiredSoldier = JSON.parse(JSON.stringify(originalSoldier))
      desiredSoldier.limitations = []
      const soldier = JSON.parse(JSON.stringify(originalSoldier))

      Async.series({
          insertSoldier: (next) => {
            this.soldiers.insertSoldier(soldier, next)
          },
          getSoldier: (next) => {
            this.db.collection('soldiers').findOne(soldier, (err, dbSoldier) => {
              expect(err).to.not.exist
              expect(dbSoldier).to.exist
              expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(desiredSoldier))              
              done()
            })
          }
        }, done
      )
    })    
  })

  describe('#findSoldier()', () => {

    it("should return error when '_id' is missing", (done) => {
      this.soldiers.findSoldier(undefined, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('_id is missing')
        done()
      })
    })

    it("should return error when '_id' is not a string", (done) => {
      this.soldiers.findSoldier(1, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('_id is not a string')
        done()
      })
    })

    it("should return empty result when there's no soldier with specified 'id'", (done) => {
      this.soldiers.findSoldier('1', (err, soldier) => {
        expect(err).to.not.exist
        expect(soldier).to.not.exist
        done()
      })
    })
    
    it("should successfully find a soldier", (done) => {
      const soldier = SoldiersData.properSoldiers[0]

      Async.series({
          insertSoldier: (next) => {
            this.db.collection('soldiers').insertOne(soldier, next)
          },
          findSoldier: (next) => {
            this.soldiers.findSoldier(soldier._id, (err, dbSoldier) => {
              expect(err).to.not.exist
              expect(dbSoldier).to.exist
              expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(soldier))
              next()
            })
          }   
        }, done
      )
    })
  })

  describe('#findSoldiers()', () => {

    it("should return error when query is missing", (done) => {
      this.soldiers.findSoldiers(undefined, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Query is missing')
        done()
      })
    })

    it("should return error when query is not an object", (done) => {
      this.soldiers.findSoldiers(5, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Query is not an object')
        done()
      })
    })

    it("should return empty array when query and soldiers collection are empty", (done) => {
      this.soldiers.findSoldiers({}, (err, soldiers) => {
        expect(err).to.not.exist
        expect(soldiers).to.exist
        expect(soldiers).to.be.instanceof(Array)
        expect(soldiers).to.have.property('length', 0)
        done()
      })
    })
    
    it("should return empty array when query for non existing property", (done) => {
      const soldiers = SoldiersData.properSoldiers

      Async.series({
          insertSoldiers: (next) => {
            this.db.collection('soldiers').insert(soldiers, next)
          },
          findSoldiers: (next) => {
            this.soldiers.findSoldiers({ tail: 'long' }, (err, soldiers) => {
              expect(err).to.not.exist
              expect(soldiers).to.exist
              expect(soldiers).to.be.instanceof(Array)
              expect(soldiers).to.have.property('length', 0)
              next()
            })
          }
        }, done
      )
    })

    it("should return all soldiers when query is empty", (done) => {
      const soldiers = SoldiersData.properSoldiers

      Async.series({
          insertSoldiers: (next) => {
            this.db.collection('soldiers').insert(soldiers, next)
          },
          findSoldiers: (next) => {
            this.soldiers.findSoldiers({}, (err, dbSoldiers) => {
              expect(err).to.not.exist
              expect(dbSoldiers).to.exist
              expect(JSON.stringify(dbSoldiers)).to.equal(JSON.stringify(soldiers))
              next()
            })
          }
        }, done
      )
    })

    it("should return only the soldiers that pass the query search", (done) => {
      const soldiers = SoldiersData.properSoldiers
      const queryName = 'Jimmy'
      const desiredSoldiers = soldiers.filter(({ name }) => { return name === queryName })

      Async.series({
          insertSoldiers: (next) => {
            this.db.collection('soldiers').insert(soldiers, next)
          },
          findSoldiers: (next) => {
            this.soldiers.findSoldiers({ name: queryName }, (err, dbSoldiers) => {
              expect(err).to.not.exist
              expect(dbSoldiers).to.exist
              expect(JSON.stringify(dbSoldiers)).to.equal(JSON.stringify(desiredSoldiers))
              next()
            })
          }
        }, done
      )
    })
  })
})