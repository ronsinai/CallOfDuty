const expect = require('chai').expect

const Helper = require('../helper')
const SoldiersData = require('../data').soldiers
const Soldiers = require('../../collections').soldiers

const DB_PATH = 'mongodb://localhost:27017/cod-test'
const COLLECTION = 'soldiers'

describe('Soldiers Collection', () => {
  before(async () => {
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
    return await this.db.close()
  })

  describe('#insertSoldier()', () => {

    it("should return error when soldier is missing", async () => {
      try {
        await this.soldiers.insertSoldier(undefined)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier object is missing')
      }
    })

    it("should return error when '_id' is missing", async () => {
      const noId = JSON.parse(JSON.stringify(SoldiersData.noId))

      try {
        await this.soldiers.insertSoldier(noId)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier _id is missing')
      }
    })

    it("should return error when '_id' already exists", async () => {
      const [firstSoldier, secondSoldier] = JSON.parse(JSON.stringify(SoldiersData.sameId))

      try {
        await this.soldiers.insertSoldier(firstSoldier)
        await this.soldiers.insertSoldier(secondSoldier)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier _id already exists')
      }
    })

    it("should return error when '_id' is not a string", async () => {
      const idNumber = JSON.parse(JSON.stringify(SoldiersData.idNumber))

      try {
        await this.soldiers.insertSoldier(idNumber)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier _id is not a string')
      }
    })
    
    it("should return error when 'name' is missing", async () => {
      const noName = JSON.parse(JSON.stringify(SoldiersData.noName))

      try {
        await this.soldiers.insertSoldier(noName)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier name is missing')
      }
    })

    it("should return error when 'name' is not a string", async () => {
      const nameNumber = JSON.parse(JSON.stringify(SoldiersData.nameNumber))

      try {
        await this.soldiers.insertSoldier(nameNumber)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier name is not a string')
      }
    })

    it("should return error when 'rank' is missing", async () => {
      const noRank = JSON.parse(JSON.stringify(SoldiersData.noRank))

      try {
        await this.soldiers.insertSoldier(noRank)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier rank is missing')
      }
    })

    it("should return error when 'rank' is not a string", async () => {
      const rankNumber = JSON.parse(JSON.stringify(SoldiersData.rankNumber))

      try {
        await this.soldiers.insertSoldier(rankNumber)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier rank is not a string')
      }
    })

    it("should return error when 'limitations' is not an array", async () => {
      const limitationsString = JSON.parse(JSON.stringify(SoldiersData.limitationsString))

      try {
        await this.soldiers.insertSoldier(limitationsString)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier limitations is not an array')
      }
    })

    it("should return error when 'limitations' is not an array of strings", async () => {
      const limitationsNumber = JSON.parse(JSON.stringify(SoldiersData.limitationsNumber))

      try {
        await this.soldiers.insertSoldier(limitationsNumber)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier limitations are not all strings')
      }
    })
    
    it("should return error when soldier has unfamiliar properties", async () => {
      const unfamiliarProperties = JSON.parse(JSON.stringify(SoldiersData.unfamiliarProperties))

      try {
        await this.soldiers.insertSoldier(unfamiliarProperties)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Soldier has unfamiliar properties')
      }
    })

    it("should successfully insert a proper soldier", async () => {
      const soldier = JSON.parse(JSON.stringify(SoldiersData.properSoldiers[0]))
      const originalSoldier = JSON.parse(JSON.stringify(soldier))
      const desiredSoldier = JSON.parse(JSON.stringify(soldier))
      desiredSoldier.duties = []

      await this.soldiers.insertSoldier(soldier)
      const dbSoldier = await this.collection.findOne(originalSoldier)
      expect(dbSoldier).to.exist
      expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(desiredSoldier))
    })

    it("should initialize 'limitations' to an empty array when missing", async () => {
      const soldier = JSON.parse(JSON.stringify(SoldiersData.noLimitations))
      const originalSoldier = JSON.parse(JSON.stringify(soldier))
      const desiredSoldier = JSON.parse(JSON.stringify(soldier))
      desiredSoldier.limitations = []
      desiredSoldier.duties = []

      await this.soldiers.insertSoldier(soldier)
      const dbSoldier = await this.collection.findOne(originalSoldier)
      expect(dbSoldier).to.exist
      expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(desiredSoldier))
    })   
  })

  describe('#findSoldier()', () => {

    it("should return error when '_id' is missing", async () => {
      try {
        await this.soldiers.findSoldier(undefined)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('_id is missing')
      }
    })

    it("should return error when '_id' is not a string", async () => {
      try {
        await this.soldiers.findSoldier(1)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('_id is not a string')
      }
    })

    it("should return empty result when there's no soldier with specified 'id'", async () => {
      const soldier = await this.soldiers.findSoldier('1')
      expect(soldier).to.not.exist
    })
    
    it("should successfully find a soldier", async () => {
      const soldier = JSON.parse(JSON.stringify(SoldiersData.properSoldiers[0]))
      const originalSoldier = JSON.parse(JSON.stringify(SoldiersData.properSoldiers[0]))

      await this.collection.insertOne(soldier)
      const dbSoldier = await this.soldiers.findSoldier(originalSoldier._id)
      expect(dbSoldier).to.exist
      expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(originalSoldier))
    })
  })

  describe('#findSoldiers()', () => {

    it("should return error when query is missing", async () => {
      try {
        await this.soldiers.findSoldiers(undefined)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Query is missing')
      }
    })

    it("should return error when query is not an object", async () => {
      try {
        await this.soldiers.findSoldiers(5)
      }
      catch (err) {
        expect(err).to.exist
        expect(err.message).to.equal('Query is not an object')
      }
    })

    it("should return empty array when query and soldiers collection are empty", async () => {
      const soldiers = await this.soldiers.findSoldiers({})
      expect(soldiers).to.exist
      expect(soldiers).to.be.instanceof(Array)
      expect(soldiers).to.have.property('length', 0)
    })
    
    it("should return empty array when query for non existing property", async () => {
      const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))

      await this.collection.insert(soldiers)
      const dbSoldiers = await this.soldiers.findSoldiers({ tail: 'long' })
      expect(dbSoldiers).to.exist
      expect(dbSoldiers).to.be.instanceof(Array)
      expect(dbSoldiers).to.have.property('length', 0)
    })

    it("should return all soldiers when query is empty", async () => {
      const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
      const originalSoldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))

      await this.collection.insert(soldiers)
      const dbSoldiers = await this.soldiers.findSoldiers({})
      expect(dbSoldiers).to.exist
      expect(dbSoldiers).to.be.instanceof(Array)
      expect(JSON.stringify(dbSoldiers)).to.equal(JSON.stringify(originalSoldiers))
    })

    it("should return only the soldiers that pass the query search", async () => {
      const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
      const queryName = 'Jimmy'
      const desiredSoldiers = JSON.parse(JSON.stringify(soldiers.filter(({ name }) => { return name === queryName })))

      await this.collection.insert(soldiers)
      const dbSoldiers = await this.soldiers.findSoldiers({ name: queryName })
      expect(dbSoldiers).to.exist
      expect(dbSoldiers).to.be.instanceof(Array)
      expect(JSON.stringify(dbSoldiers)).to.equal(JSON.stringify(desiredSoldiers))
    })
  })
})