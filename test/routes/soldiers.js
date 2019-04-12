const Async = require('async')
const expect = require('chai').expect
const Request = require('request')

const Index = require('../../')
const Helper = require('../helper')
const SoldiersData = require('../data').soldiers
const Soldiers = require('../../collections').soldiers

const DB_PATH = 'mongodb://localhost:27017/cod-test'
const HOST = 'localhost'
const PORT = 8000
const COLLECTION = 'soldiers'

describe('Soldiers Routes', () => {
  before((done) => {
    Async.series({
        startServer: (next) => {
          Index.init(PORT, HOST, DB_PATH, (err, server) => {
            if (err) return next(err)

            this.server = server
            next()
          })
        },
        connectoToDb: (next) => {
          Helper.connectoToDb(DB_PATH, (err, db) => {
            if (err) return next(err)
      
            this.db = db
            this.collection = db.collection(COLLECTION)
            this.soldiers = new Soldiers(db)
            next()
          })
        }
      }, done
    )
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
        },
        closeServer: (next) => {
          this.server.close(next)
        }
      }, done
    )
  })

  describe('#POST', () => {
    const postOptions = {
      method: 'POST',
      url: `http://${HOST}:${PORT}/${COLLECTION}`
    }

    it("should return 400 when soldier object is defected", (done) => {
      const soldier = SoldiersData.idNumber
      const options = Object.assign({ form: JSON.stringify(soldier) }, postOptions)

      Request(options, (err, response) => {
        expect(err).to.not.exist
        expect(response).to.have.property('statusCode', 400)
        done()
      })
    })

    it("should return 409 when soldier '_id' already exists", (done) => {
      const [firstSoldier, secondSoldier] = JSON.parse(JSON.stringify(SoldiersData.sameId))

      Async.series({
          insertFirstSoldier: (next) => {
            this.soldiers.insertSoldier(firstSoldier, next)
          },
          insertSecondSoldier: (next) => {
            const options = Object.assign({ form: JSON.stringify(secondSoldier) }, postOptions)
            Request(options, (err, response) => {
              expect(err).to.not.exist
              expect(response).to.have.property('statusCode', 409)
              done()
            })
          }
        }, done
      )
    })

    it("should return 404 when url path is longer than 1 item", (done) => {
      const soldier = SoldiersData.properSoldiers[0]
      const options = Object.assign({ form: JSON.stringify(soldier) }, postOptions)
      options.url += '/anotherone'

      Request(options, (err, response) => {
        expect(err).to.not.exist
        expect(response).to.have.property('statusCode', 404)
        done()
      })
    })

    it("should return 204 when soldier is successfully inserted", (done) => {
      const soldier = SoldiersData.properSoldiers[0]
      const desiredSoldier = JSON.parse(JSON.stringify(soldier))
      desiredSoldier.duties = []
      const options = Object.assign({ form: JSON.stringify(soldier) }, postOptions)

      Async.series({
          insertSoldier: (next) => {
            Request(options, (err, response) => {
              expect(err).to.not.exist
              expect(response).to.have.property('statusCode', 204)
              next()
            })
          },
          validateInsertion: (next) => {
            this.collection.findOne(soldier, (err, dbSoldier) => {
              expect(err).to.not.exist
              expect(dbSoldier).to.exist
              expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(desiredSoldier))
              next()
            })
          }
        }, done
      )
    })
  })

  describe('#GET', () => {
    const getOptions = {
      method: 'GET',
      url: `http://${HOST}:${PORT}/${COLLECTION}`
    }

    it("should return 404 when url path is longer than 2 items", (done) => {
      const options = Object.assign({}, getOptions)
      options.url += '/anotherone/anothertwo'

      Request(options, (err, response) => {
        expect(err).to.not.exist
        expect(response).to.have.property('statusCode', 404)
        done()
      })
    })

    describe('Single Soldier', () => {
      it("should return 404 when soldier does not exist", (done) => {
        const options = Object.assign({}, getOptions)
        options.url += '/1'

        Request(options, (err, response) => {
          expect(err).to.not.exist
          expect(response).to.have.property('statusCode', 404)
          done()
        })
      })

      it("should return 200 when soldier exists", (done) => {
        const soldier = JSON.parse(JSON.stringify(SoldiersData.properSoldiers[0]))

        Async.series({
            insertSoldier: (next) => {
              this.collection.insertOne(soldier, next)
            },
            findSoldier: (next) => {
              const options = Object.assign({}, getOptions)
              options.url += `/${soldier._id}`

              Request(options, (err, response, body) => {
                expect(err).to.not.exist
                expect(response).to.have.property('statusCode', 200)
                expect(body).to.exist
                body = JSON.parse(body)
                expect(body._id).to.equal(soldier._id)
                next()
              })
            }
          }, done
        )
      })
    })

    describe('Multiple Soldiers', () => {

      it("should return 200 with an empty array when soldiers collection is empty", (done) => {
        Request(getOptions, (err, response, body) => {
          expect(err).to.not.exist
          expect(response).to.have.property('statusCode', 200)
          expect(body).to.exist
          body = JSON.parse(body)
          expect(body).to.be.instanceof(Array)
          expect(body).to.have.property('length', 0)
          done()
        })
      })
      
      it("should return 200 with array of all soldiers when there's no query", (done) => {
        const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))

        Async.series({
            insertSoldiers: (next) => {
              this.collection.insert(soldiers, next)
            },
            findSoldiers: (next) => {
              Request(getOptions, (err, response, body) => {
                expect(err).to.not.exist
                expect(response).to.have.property('statusCode', 200)
                expect(body).to.exist
                body = JSON.parse(body)
                expect(JSON.stringify(body)).to.equal(JSON.stringify(soldiers))
                next()
              })
            }
          }, done
        )
      })

      it("should return 200 with an empty array when no soldiers matched query", (done) => {
        const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))

        Async.series({
            insertSoldiers: (next) => {
              this.collection.insert(soldiers, next)
            },
            findSoldiers: (next) => {
              const options = Object.assign({ qs: { tail: 'long' } }, getOptions)

              Request(options, (err, response, body) => {
                expect(err).to.not.exist
                expect(response).to.have.property('statusCode', 200)
                expect(body).to.exist
                body = JSON.parse(body)
                expect(body).to.be.instanceof(Array)
                expect(body).to.have.property('length', 0)
                next()
              })
            }
          }, done
        )
      })

      it("should return 200 with correct soldiers when there's query", (done) => {
        const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
        const queryName = 'Jimmy'
        const desiredSoldiers = JSON.parse(JSON.stringify(soldiers.filter(({ name }) => { return name === queryName })))

        Async.series({
            insertSoldiers: (next) => {
              this.collection.insert(soldiers, next)
            },
            findSoldiers: (next) => {
              const options = Object.assign({ qs: { name: queryName } }, getOptions)

              Request(options, (err, response, body) => {
                expect(err).to.not.exist
                expect(response).to.have.property('statusCode', 200)
                expect(body).to.exist
                body = JSON.parse(body)
                expect(JSON.stringify(body)).to.equal(JSON.stringify(desiredSoldiers))
                next()
              })
            }
          }, done
        )
      })
    })
  })
})