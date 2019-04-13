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
  before(async () => {
    const server = await Index.init(PORT, HOST, DB_PATH)
    this.server = server
    
    const db = await Helper.connectoToDb(DB_PATH)
    this.db = db
    this.collection = db.collection(COLLECTION)
    this.soldiers = new Soldiers(db)
  })
  beforeEach(async () => {
    return await Helper.clearCollection(this.db, COLLECTION)
  })

  after(async () => {
    await Helper.clearCollection(this.db, COLLECTION)
    await this.db.close()
    return await this.server.close()
  })

  describe('#POST', () => {
    const postOptions = {
      method: 'POST',
      url: `http://${HOST}:${PORT}/${COLLECTION}`,
      resolveWithFullResponse: true
    }

    it("should return 400 when soldier object is defected", async () => {
      const soldier = SoldiersData.idNumber
      const options = Object.assign({ form: JSON.stringify(soldier) }, postOptions)

      try {
        await Request(options)
      }
      catch (err) {
        expect(err).to.exist
        expect(err).to.have.property('statusCode', 400)
      }
    })

    it("should return 409 when soldier '_id' already exists", async () => {
      const [firstSoldier, secondSoldier] = JSON.parse(JSON.stringify(SoldiersData.sameId))
      const options = Object.assign({ form: JSON.stringify(secondSoldier) }, postOptions)

      await this.soldiers.insertSoldier(firstSoldier)
      try {
        await Request(options)
      }
      catch (err) {
        expect(err).to.exist
        expect(err).to.have.property('statusCode', 409)
      }
    })

    it("should return 404 when url path is longer than 1 item", async () => {
      const soldier = SoldiersData.properSoldiers[0]
      const options = Object.assign({ form: JSON.stringify(soldier) }, postOptions)
      options.url += '/anotherone'

      try {
        await Request(options)
      }
      catch (err) {
        expect(err).to.exist
        expect(err).to.have.property('statusCode', 404)
      }
    })

    it("should return 204 when soldier is successfully inserted", async () => {
      const soldier = SoldiersData.properSoldiers[0]
      const desiredSoldier = JSON.parse(JSON.stringify(soldier))
      desiredSoldier.duties = []
      const options = Object.assign({ form: JSON.stringify(soldier) }, postOptions)

      const response = await Request(options)
      expect(response).to.exist
      expect(response).to.have.property('statusCode', 204)

      const dbSoldier = await this.collection.findOne(soldier)
      expect(dbSoldier).to.exist
      expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(desiredSoldier))
    })
  })

  describe('#GET', () => {
    const getOptions = {
      method: 'GET',
      url: `http://${HOST}:${PORT}/${COLLECTION}`,
      resolveWithFullResponse: true
    }

    it("should return 404 when url path is longer than 2 items", async () => {
      const options = Object.assign({}, getOptions)
      options.url += '/anotherone/anothertwo'

      try {
        await Request(options)
      }
      catch (err) {
        expect(err).to.exist
        expect(err).to.have.property('statusCode', 404)
      }
    })

    describe('Single Soldier', () => {

      it("should return 404 when soldier does not exist", async () => {
        const options = Object.assign({}, getOptions)
        options.url += '/1'

        try {
          await Request(options)
        }
        catch (err) {
          expect(err).to.exist
          expect(err).to.have.property('statusCode', 404)
        }
      })

      it("should return 200 when soldier exists", async () => {
        const soldier =JSON.parse(JSON.stringify( SoldiersData.properSoldiers[0]))
        const options = Object.assign({}, getOptions)
        options.url += `/${soldier._id}`

        await this.collection.insertOne(soldier)
        const response = await Request(options)

        expect(response).to.exist
        expect(response).to.have.property('statusCode', 200)
        expect(response.body).to.exist
        const body = JSON.parse(response.body)
        expect(body._id).to.equal(soldier._id)
      })
    })

    describe('Multiple Soldiers', () => {

      it("should return 200 with an empty array when soldiers collection is empty", async () => {
        const response = await Request(getOptions)
        expect(response).to.exist
        expect(response).to.have.property('statusCode', 200)
        expect(response.body).to.exist
        const body = JSON.parse(response.body)
        expect(body).to.be.instanceof(Array)
        expect(body).to.have.property('length', 0)
      })
      
      it("should return 200 with array of all soldiers when there's no query", async () => {
        const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))

        await this.collection.insert(soldiers)
        const response = await Request(getOptions)

        expect(response).to.exist
        expect(response).to.have.property('statusCode', 200)
        expect(response.body).to.exist
        const body = JSON.parse(response.body)
        expect(JSON.stringify(body)).to.equal(JSON.stringify(soldiers))
      })

      it("should return 200 with an empty array when no soldiers matched query", async () => {
        const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
        const options = Object.assign({ qs: { tail: 'long' } }, getOptions)

        await this.collection.insert(soldiers)
        const response = await Request(options)

        expect(response).to.exist
        expect(response).to.have.property('statusCode', 200)
        expect(response.body).to.exist
        const body = JSON.parse(response.body)
        expect(body).to.be.instanceof(Array)
        expect(body).to.have.property('length', 0)
      })

      it("should return 200 with correct soldiers when there's query", async () => {
        const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
        const queryName = 'Jimmy'
        const desiredSoldiers = JSON.parse(JSON.stringify(soldiers.filter(({ name }) => { return name === queryName })))
        const options = Object.assign({ qs: { name: queryName } }, getOptions)

        await this.collection.insert(soldiers)
        const response = await Request(options)

        expect(response).to.exist
        expect(response).to.have.property('statusCode', 200)
        expect(response.body).to.exist
        const body = JSON.parse(response.body)
        expect(JSON.stringify(body)).to.equal(JSON.stringify(desiredSoldiers))
      })
    })
  })
})