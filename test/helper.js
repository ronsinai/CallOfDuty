const MongoClient = require('mongodb').MongoClient

module.exports = {
  connectoToDb: (db, done) => {
    MongoClient.connect(db, (err, db) => {
      if (err) {
        return done(err)
      }
      else if (!db) {
        return done(new Error('DB failure.'))
      }

      done(null, db)
    })
  },
  clearCollection: (db, collection, done) => {
    db.listCollections({ name: collection })
      .next((err, collinfo) => {
        if (err) {
          return done(err)
        }
        else if (collinfo) {
          return db.collection(collection).drop(done)
        }

        done()
      })
  }
}