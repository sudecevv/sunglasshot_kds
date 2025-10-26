// routes/api.js
const express = require('express');
const router = express.Router();
const db = require('../models/db');

// En çok satış yapan şubeler (LIMIT kaldırıldı)
router.get('/en-cok-satan-sube', (req, res) => {
  const sql = `
    SELECT sube_ad, SUM(satis) AS toplam_satis
    FROM sube
    GROUP BY sube_ad
    ORDER BY toplam_satis DESC;
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Sorgu hatası:', err);
      return res.status(500).json({ error: err.message });
    }
    res.json(results);
  });
});

module.exports = router;
