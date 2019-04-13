const expect = require('chai').expect

const Helper = require('../helper')
const SoldiersData = require('../data').soldiers
const Soldiers = require('../../collections').soldiers

const DB_PATH = 'mongodb://localhost:27017/cod-test'
const COLLECTION = 'soldiers'

describe('Soldiers Collection', () => {
  before(() => {
    return Helper.connectoToDb(DB_PATH)
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
      .then(() => { return this.db.close() })
  })

  describe('#insertSoldier()', () => {

    it("should return error when soldier is missing", () => {
      return this.soldiers.insertSoldier(undefined)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier object is missing')
        })
    })

    it("should return error when '_id' is missing", () => {
      const noId = JSON.parse(JSON.stringify(SoldiersData.noId))

      return this.soldiers.insertSoldier(noId)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier _id is missing')
        })
    })

    it("should return error when '_id' already exists", () => {
      const [firstSoldier, secondSoldier] = JSON.parse(JSON.stringify(SoldiersData.sameId))

      return this.soldiers.insertSoldier(firstSoldier)
        .then(() => {
          return this.soldiers.insertSoldier(secondSoldier)
        })
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier _id already exists')
        })
    })

    it("should return error when '_id' is not a string", () => {
      const idNumber = JSON.parse(JSON.stringify(SoldiersData.idNumber))

      return this.soldiers.insertSoldier(idNumber)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier _id is not a string')
        })
    })
    
    it("should return error when 'name' is missing", () => {
      const noName = JSON.parse(JSON.stringify(SoldiersData.noName))

      return this.soldiers.insertSoldier(noName)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier name is missing')
        })
    })

    it("should return error when 'name' is not a string", () => {
      const nameNumber = JSON.parse(JSON.stringify(SoldiersData.nameNumber))

      return this.soldiers.insertSoldier(nameNumber)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier name is not a string')
        })
    })

    it("should return error when 'rank' is missing", () => {
      const noRank = JSON.parse(JSON.stringify(SoldiersData.noRank))

      return this.soldiers.insertSoldier(noRank)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier rank is missing')
        })
    })

    it("should return error when 'rank' is not a string", () => {
      const rankNumber = JSON.parse(JSON.stringify(SoldiersData.rankNumber))

      return this.soldiers.insertSoldier(rankNumber)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier rank is not a string')
        })
    })

    it("should return error when 'limitations' is not an array", () => {
      const limitationsString = JSON.parse(JSON.stringify(SoldiersData.limitationsString))

      return this.soldiers.insertSoldier(limitationsString)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier limitations is not an array')
        })
    })

    it("should return error when 'limitations' is not an array of strings", () => {
      const limitationsNumber = JSON.parse(JSON.stringify(SoldiersData.limitationsNumber))

      return this.soldiers.insertSoldier(limitationsNumber)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier limitations are not all strings')
        })
    })
    
    it("should return error when soldier has unfamiliar properties", () => {
      const unfamiliarProperties = JSON.parse(JSON.stringify(SoldiersData.unfamiliarProperties))

      return this.soldiers.insertSoldier(unfamiliarProperties)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Soldier has unfamiliar properties')
        })
    })

    it("should successfully insert a proper soldier", () => {
      const soldier = JSON.parse(JSON.stringify(SoldiersData.properSoldiers[0]))
      const originalSoldier = JSON.parse(JSON.stringify(soldier))
      const desiredSoldier = JSON.parse(JSON.stringify(soldier))
      desiredSoldier.duties = []

      return this.soldiers.insertSoldier(soldier)
        .then(() => {
          return this.collection.findOne(originalSoldier)
        })
        .then((dbSoldier) => {
          expect(dbSoldier).to.exist
          expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(desiredSoldier))
        })
    })

    it("should initialize 'limitations' to an empty array when missing", () => {
      const soldier = JSON.parse(JSON.stringify(SoldiersData.noLimitations))
      const originalSoldier = JSON.parse(JSON.stringify(soldier))
      const desiredSoldier = JSON.parse(JSON.stringify(soldier))
      desiredSoldier.limitations = []
      desiredSoldier.duties = []

      return this.soldiers.insertSoldier(soldier)
        .then(() => {
          return this.collection.findOne(originalSoldier)
        })
        .then((dbSoldier) => {
          expect(dbSoldier).to.exist
          expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(desiredSoldier))
        })
    })   
  })

  describe('#findSoldier()', () => {

    it("should return error when '_id' is missing", () => {
      return this.soldiers.findSoldier(undefined)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('_id is missing')
        })
    })

    it("should return error when '_id' is not a string", () => {
      return this.soldiers.findSoldier(1)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('_id is not a string')
        })
    })

    it("should return empty result when there's no soldier with specified 'id'", () => {
      return this.soldiers.findSoldier('1')
        .then((soldier) => {
          expect(soldier).to.not.exist
        })
    })
    
    it("should successfully find a soldier", () => {
      const soldier = JSON.parse(JSON.stringify(SoldiersData.properSoldiers[0]))
      const originalSoldier = JSON.parse(JSON.stringify(SoldiersData.properSoldiers[0]))

      return this.collection.insertOne(soldier)
        .then(() => {
          return this.soldiers.findSoldier(originalSoldier._id)
        })
        .then((dbSoldier) => {
          expect(dbSoldier).to.exist
          expect(JSON.stringify(dbSoldier)).to.equal(JSON.stringify(originalSoldier))
        })
    })
  })

  describe('#findSoldiers()', () => {

    it("should return error when query is missing", () => {
      return this.soldiers.findSoldiers(undefined)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Query is missing')
        })
    })

    it("should return error when query is not an object", () => {
      return this.soldiers.findSoldiers(5)
        .catch((err) => {
          expect(err).to.exist
          expect(err.message).to.equal('Query is not an object')
        })
    })

    it("should return empty array when query and soldiers collection are empty", () => {
      return this.soldiers.findSoldiers({})
        .then((soldiers) => {
          expect(soldiers).to.exist
          expect(soldiers).to.be.instanceof(Array)
          expect(soldiers).to.have.property('length', 0)
        })
    })
    
    it("should return empty array when query for non existing property", () => {
      const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))

      return this.collection.insert(soldiers)
        .then(() => {
          return this.soldiers.findSoldiers({ tail: 'long' })
        })
        .then((dbSoldiers) => {
          expect(dbSoldiers).to.exist
          expect(dbSoldiers).to.be.instanceof(Array)
          expect(dbSoldiers).to.have.property('length', 0)
        })
    })

    it("should return all soldiers when query is empty", () => {
      const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
      const originalSoldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))

      return this.collection.insert(soldiers)
        .then(() => {
          return this.soldiers.findSoldiers({})
        })
        .then((dbSoldiers) => {
          expect(dbSoldiers).to.exist
          expect(dbSoldiers).to.be.instanceof(Array)
          expect(JSON.stringify(dbSoldiers)).to.equal(JSON.stringify(originalSoldiers))
        })
    })

    it("should return only the soldiers that pass the query search", () => {
      const soldiers = JSON.parse(JSON.stringify(SoldiersData.properSoldiers))
      const queryName = 'Jimmy'
      const desiredSoldiers = JSON.parse(JSON.stringify(soldiers.filter(({ name }) => { return name === queryName })))

      return this.collection.insert(soldiers)
        .then(() => {
          return this.soldiers.findSoldiers({ name: queryName })
        })
        .then((dbSoldiers) => {
          expect(dbSoldiers).to.exist
          expect(dbSoldiers).to.be.instanceof(Array)
          expect(JSON.stringify(dbSoldiers)).to.equal(JSON.stringify(desiredSoldiers))
        })
    })
  })
})