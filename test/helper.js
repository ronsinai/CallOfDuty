const MongoClient = require('mongodb').MongoClient

module.exports = {
  connectoToDb: (db) => {
    return new Promise((resolve, reject) => {
      MongoClient.connect(db)
        .then((db) => {
          if (!db) return reject(new Error('DB failure.'))
          resolve(db)
        })
        .catch(reject)
    })
  },
  clearCollection: (db, collection) => {
    return new Promise((resolve, reject) => {
      db.listCollections({ name: collection }).next()
        .then((collinfo) => {
          if (collinfo) {
            db.collection(collection).drop().then(resolve).catch(reject)
          }
          resolve()
        })
        .catch(reject)
    })
  }
}