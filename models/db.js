// models/db.js
const mysql = require('mysql2');
const config = require('../config/config.js'); 

const db = mysql.createConnection(config);

db.connect((err) => {
  if (err) {
    console.error('❌ Veritabanı bağlantı hatası:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Veritabanına başarıyla bağlanıldı!');
  }
});

module.exports = db;
