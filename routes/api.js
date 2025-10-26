const express = require('express');
const router = express.Router();
const db = require('../models/db');

// En çok satış yapan şubeler
router.get('/en-cok-satan-sube', (req, res) => {
  const sql = `
    SELECT s.sube_ad, SUM(sa.adet) AS toplam_satis
    FROM satis sa
    JOIN sube s ON sa.sube_id = s.sube_id
    GROUP BY s.sube_ad
    ORDER BY toplam_satis DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Sorgu hatası:', err.sqlMessage); // ← düzeltildi
      return res.status(500).json({ error: err.sqlMessage });
    }

    console.log('✅ API sonuçları:', results);
    res.json(results);
  });
});

module.exports = router;

