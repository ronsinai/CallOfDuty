const MongoClient = require('mongodb').MongoClient

module.exports = {
  connectoToDb: async (dbPath) => {
    const db = await MongoClient.connect(dbPath)
    if (!db) throw new Error('DB failure.')
    return db
  },
  clearCollection: async (db, collection) => {
    const collinfo = await db.listCollections({ name: collection }).next()
    if (collinfo) {
      return await db.collection(collection).drop()
    }
  }
}