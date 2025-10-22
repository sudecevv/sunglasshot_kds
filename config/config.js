const mysql = require('mysql2');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '', // Şifreniz burada doğru olmalı
    database: 'sunglasshot_kds',
});

db.connect((err) => {
    if (err) {
        console.error('Veritabanına bağlanırken hata oluştu:', err);
        process.exit(1); // Hata durumunda uygulamayı durdur
    } else {
        console.log('Veritabanına başarıyla bağlanıldı.');
    }
});

module.exports = db;