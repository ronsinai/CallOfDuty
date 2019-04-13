const expect = require('chai').expect
const Request = require('request-promise')

const Index = require('../../')
const Helper = require('../helper')
const SoldiersData = require('../data').soldiers
const Soldiers = require('../../collections').soldiers

const DB_PATH = 'mongodb://localhost:27017/cod-test'
const HOST = 'localhost'
const PORT = 8000
const COLLECTION = 'soldiers'

describe('Soldiers Routes', () => {
  before(() => {
    return Index.init(PORT, HOST, DB_PATH)
      .then((server) => {
        this.server = server
        return Helper.connectoToDb(DB_PATH)
      })
      .then((db) => {
        this.db = db
        this.collection = db.collection(COLLECTION)
        this.soldiers = new Soldiers(db)
      })
  })
  beforeEach(() => {
    return Helper.clearCollection(this.db, COLLECTION)
  })

  after(() => {
    return Helper.clearCollection(this.db, COLLECTION)
      .then(() => {
        return this.db.close()
      })
      .then(() => {
        return this.server.close()
      })
  })

  describe('#POST', () => {
    const postOptions = {
      method: 'POST',
      url: `http://${HOST}:${PORT}/${COLLECTION}`,
      resolveWithFullResponse: true
    }

    it("should return 400 when soldier object is defected", () => {
      const soldier = SoldiersData.idNumber
      const options = Object.assign({ form: JSON.stringify(soldier) }, postOptions)

      return Request(options)
        .catch((err) => {
          expect(err).to.exist
          expect(err).to.have.property('statusCode', 400)
        })
    })

    it("should return 409 when soldier '_id' already exists", () => {
      const [firstSoldier, secondSoldier] = JSON.parse(JSON.stringify(SoldiersData.sameId))

      return this.soldiers.insertSoldier(firstSoldier)
        .then(() => {
          const options = Object.assign({ form: JSON.stringify(secondSoldier) }, postOptions)
          return Request(options)
        })
        .catch((err) => {
          expect(err).to.exist
          expect(err).to.have.property('statusCode', 409)
        })
    })

    it("should return 404 when url path is longer than 1 item", () => {
      const soldier = SoldiersData.properSoldiers[0]
      const options = Object.assign({ form: JSON.stringify(soldier) }, postOptions)
      options.url += '/anotherone'

      return Request(options)
        .catch((err) => {
          expect(err).to.exist
          expect(err).to.have.property('statusCode', 404)
        })
    })

    it("should return 204 when soldier is successfully inserted", () => {
      const soldier = SoldiersData.properSoldiers[0]
      const desiredSoldier = JSON.parse(JSON.stringify(soldier))
      desiredSoldier.duties = []
      const options = Object.assign({ form: JSON.stringify(soldier) }, postOptions)

      return Request(options)
        .then((response) => {
          expect(response).to.exist
          expect(response).to.have.property('statusCode', 204)

          return this.collection.findOne(soldier)
        })
        .then((dbSoldier) => {
          expect(dbSoldier).to.exist
          expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(desiredSoldier))
        })
    })
  })

  describe('#GET', () => {
    const getOptions = {
      method: 'GET',
      url: `http://${HOST}:${PORT}/${COLLECTION}`,
      resolveWithFullResponse: true
    }

    it("should return 404 when url path is longer than 2 items", () => {
      const options = Object.assign({}, getOptions)
      options.url += '/anotherone/anothertwo'

      return Request(options)
        .catch((err) => {
          expect(err).to.exist
          expect(err).to.have.property('statusCode', 404)
        })
    })

    describe('Single Soldier', () => {

      it("should return 404 when soldier does not exist", () => {
        const options = Object.assign({}, getOptions)
        options.url += '/1'

        return Request(options)
          .catch((err) => {
            expect(err).to.exist
            expect(err).to.have.property('statusCode', 404)
          })
      })

      it("should return 200 when soldier exists", () => {
        const soldier =JSON.parse(JSON.stringify( SoldiersData.properSoldiers[0]))
        const options = Object.assign({}, getOptions)
        options.url += `/${soldier._id}`

        return this.collection.insertOne(soldier)
          .then(() => { return Request(options) })
          .then((response) => {
            expect(response).to.exist
            expect(response).to.have.property('statusCode', 200)
            expect(response.body).to.exist
            const body = JSON.parse(response.body)
            expect(body._id).to.equal(soldier._id)
          })
      })
    })

    describe('Multiple Soldiers', () => {

      it("should return 200 with an empty array when soldiers collection is empty", () => {
        return Request(getOptions)
          .then((response) => {
            expect(response).to.exist
            expect(response).to.have.property('statusCode', 200)
            expect(response.body).to.exist
            const body = JSON.parse(response.body)
            expect(body).to.be.instanceof(Array)
            expect(body).to.have.property('length', 0)
          })
      })
      
      it("should return 200 with array of all soldiers when there's no query", () => {
        const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))

        return this.collection.insert(soldiers)
          .then(() => { return Request(getOptions) })
          .then((response) => {
            expect(response).to.exist
            expect(response).to.have.property('statusCode', 200)
            expect(response.body).to.exist
            const body = JSON.parse(response.body)
            expect(JSON.stringify(body)).to.equal(JSON.stringify(soldiers))
          })
      })

      it("should return 200 with an empty array when no soldiers matched query", () => {
        const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
        const options = Object.assign({ qs: { tail: 'long' } }, getOptions)

        return this.collection.insert(soldiers)
          .then(() => { return Request(options) })
          .then((response) => {
            expect(response).to.exist
            expect(response).to.have.property('statusCode', 200)
            expect(response.body).to.exist
            const body = JSON.parse(response.body)
            expect(body).to.be.instanceof(Array)
            expect(body).to.have.property('length', 0)
          })
      })

      it("should return 200 with correct soldiers when there's query", () => {
        const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
        const queryName = 'Jimmy'
        const desiredSoldiers = JSON.parse(JSON.stringify(soldiers.filter(({ name }) => { return name === queryName })))
        const options = Object.assign({ qs: { name: queryName } }, getOptions)

        return this.collection.insert(soldiers)
          .then(() => { return Request(options) })
          .then((response) => {
            expect(response).to.exist
            expect(response).to.have.property('statusCode', 200)
            expect(response.body).to.exist
            const body = JSON.parse(response.body)
            expect(JSON.stringify(body)).to.equal(JSON.stringify(desiredSoldiers))
          })
      })
    })
  })
})