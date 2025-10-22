const db = require('../config/config');

// Örnek bir sorgu fonksiyonu
function getAllData(tableName, callback) {
  const query = 'SELECT * FROM ${tableName}';
  db.query(query, (err, results) => {
    if (err) return callback(err);
    callback(null, results);
  });
}

module.exports = { getAllData };