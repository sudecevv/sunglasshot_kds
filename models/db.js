// models/db.js
const mysql = require('mysql2');
const config = require('../config/config.js'); // 🔥 dikkat: ../ ile bir üst klasöre çıkıyoruz

const db = mysql.createConnection(config);

db.connect((err) => {
  if (err) {
    console.error('❌ Veritabanı bağlantı hatası:', err.message);
    process.exit(1);
  } else {
    console.log('✅ Veritabanına başarıyla bağlanıldı!');
  }
});

db.query('SELECT * FROM ilce', (err, results) => {
  if (err) {
    console.error('Sorgu hatası:', err);
    return;
  }
  console.log('Veriler:', results);
});

module.exports = db;
