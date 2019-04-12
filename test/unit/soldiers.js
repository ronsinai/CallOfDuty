const Async = require('async')
const expect = require('chai').expect

const Helper = require('../helper')
const SoldiersData = require('../data').soldiers
const Soldiers = require('../../collections').soldiers

const DB = 'mongodb://localhost:27017/cod-test'
const COLLECTION = 'soldiers'

describe('Soldiers Collection', () => {
  before((done) => {
    Helper.connectoToDb(DB, (err, db) => {
      if (err) return next(err)

      this.db = db
      this.collection = db.collection(COLLECTION)
      this.soldiers = new Soldiers(db)
      done()
    })
  })
  beforeEach((done) => {
    Helper.clearCollection(this.db, COLLECTION, done)
  })

  after((done) => {
    Async.series({
        clearSoldiersCollection: (next) => {
          Helper.clearCollection(this.db, COLLECTION, next)
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
      const noId = JSON.parse(JSON.stringify(SoldiersData.noId))

      this.soldiers.insertSoldier(noId, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier _id is missing')
        done()
      })
    })

    it("should return error when '_id' already exists", (done) => {
      const [firstSoldier, secondSoldier] = JSON.parse(JSON.stringify(SoldiersData.sameId))

      Async.series({
          insertFirstSoldier: (next) => {
            this.soldiers.insertSoldier(firstSoldier, next)
          },
          insertSoldierWithSameId: next => {
            this.soldiers.insertSoldier(secondSoldier, (err) => {
              expect(err).to.exist
              expect(err.message).to.equal('Soldier _id already exists')
              next()
            })
          }
        }, done
      )
    })

    it("should return error when '_id' is not a string", (done) => {
      const idNumber = JSON.parse(JSON.stringify(SoldiersData.idNumber))

      this.soldiers.insertSoldier(idNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier _id is not a string')
        done()
      })
    })
    
    it("should return error when 'name' is missing", (done) => {
      const noName = JSON.parse(JSON.stringify(SoldiersData.noName))

      this.soldiers.insertSoldier(noName, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier name is missing')
        done()
      })
    })

    it("should return error when 'name' is not a string", (done) => {
      const nameNumber = JSON.parse(JSON.stringify(SoldiersData.nameNumber))

      this.soldiers.insertSoldier(nameNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier name is not a string')
        done()
      })
    })

    it("should return error when 'rank' is missing", (done) => {
      const noRank = JSON.parse(JSON.stringify(SoldiersData.noRank))

      this.soldiers.insertSoldier(noRank, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier rank is missing')
        done()
      })
    })

    it("should return error when 'rank' is not a string", (done) => {
      const rankNumber = JSON.parse(JSON.stringify(SoldiersData.rankNumber))

      this.soldiers.insertSoldier(rankNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier rank is not a string')
        done()
      })
    })

    it("should return error when 'limitations' is not an array", (done) => {
      const limitationsString = JSON.parse(JSON.stringify(SoldiersData.limitationsString))

      this.soldiers.insertSoldier(limitationsString, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier limitations is not an array')
        done()
      })
    })

    it("should return error when 'limitations' is not an array of strings", (done) => {
      const limitationsNumber = JSON.parse(JSON.stringify(SoldiersData.limitationsNumber))

      this.soldiers.insertSoldier(limitationsNumber, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier limitations are not all strings')
        done()
      })
    })
    
    it("should return error when soldier has unfamiliar properties", (done) => {
      const unfamiliarProperties = JSON.parse(JSON.stringify(SoldiersData.unfamiliarProperties))

      this.soldiers.insertSoldier(unfamiliarProperties, (err) => {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier has unfamiliar properties')
        done()
      })
    })

    it("should successfully insert a proper soldier", (done) => {
      const soldier = JSON.parse(JSON.stringify(SoldiersData.properSoldiers[0]))
      const originalSoldier = JSON.parse(JSON.stringify(soldier))
      const desiredSoldier = JSON.parse(JSON.stringify(soldier))
      desiredSoldier.duties = []

      Async.series({
          insertSoldier: (next) => {
            this.soldiers.insertSoldier(soldier, next)
          },
          getSoldier: (next) => {
            this.collection.findOne(originalSoldier, (err, dbSoldier) => {
              expect(err).to.not.exist
              expect(dbSoldier).to.exist
              expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(desiredSoldier))
              done()
            })
          }
        }, done
      )
    })

    it("should initialize 'limitations' to an empty array when missing", (done) => {
      const soldier = JSON.parse(JSON.stringify(SoldiersData.noLimitations))
      const originalSoldier = JSON.parse(JSON.stringify(soldier))
      const desiredSoldier = JSON.parse(JSON.stringify(soldier))
      desiredSoldier.limitations = []
      desiredSoldier.duties = []

      Async.series({
          insertSoldier: (next) => {
            this.soldiers.insertSoldier(soldier, next)
          },
          getSoldier: (next) => {
            this.collection.findOne(originalSoldier, (err, dbSoldier) => {
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
      const soldier = JSON.parse(JSON.stringify(SoldiersData.properSoldiers[0]))
      const originalSoldier = JSON.parse(JSON.stringify(soldier))

      Async.series({
          insertSoldier: (next) => {
            this.collection.insertOne(soldier, next)
          },
          findSoldier: (next) => {
            this.soldiers.findSoldier(originalSoldier._id, (err, dbSoldier) => {
              expect(err).to.not.exist
              expect(dbSoldier).to.exist
              expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(originalSoldier))
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
      const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))

      Async.series({
          insertSoldiers: (next) => {
            this.collection.insert(soldiers, next)
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
      const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
      const originalSoldiers = JSON.parse(JSON.stringify(soldiers))

      Async.series({
          insertSoldiers: (next) => {
            this.collection.insert(soldiers, next)
          },
          findSoldiers: (next) => {
            this.soldiers.findSoldiers({}, (err, dbSoldiers) => {
              expect(err).to.not.exist
              expect(dbSoldiers).to.exist
              expect(JSON.stringify(dbSoldiers)).to.equal(JSON.stringify(originalSoldiers))
              next()
            })
          }
        }, done
      )
    })

    it("should return only the soldiers that pass the query search", (done) => {
      const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
      const queryName = 'Jimmy'
      const desiredSoldiers = JSON.parse(JSON.stringify(soldiers.filter(({ name }) => { return name === queryName })))

      Async.series({
          insertSoldiers: (next) => {
            this.collection.insert(soldiers, next)
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