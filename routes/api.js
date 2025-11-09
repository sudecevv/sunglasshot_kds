const express = require('express');
const router = express.Router();
const db = require('../models/db');

router.get('/data/:table', (req, res) => {
  const tableName = req.params.table;

  if (!tableName) {
    return res.status(400).json({ message: 'Tablo adı gerekli.' });
  }

  const query = `SELECT * FROM ??`;
  db.execute(query, [tableName], (err, results) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).json({ message: 'Bir sunucu hatası oluştu.' });
    }

    res.json(results);
  });
});

// En çok satış yapan şubeler (yıl parametresi ile)
router.get('/top-sales', (req, res) => {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: 'Yıl bilgisi gerekli.' });

    const query = `
        SELECT 
            s.sube_ad AS branch_name,
            SUM(sa.adet) AS total_sales
        FROM 
            sube s
        JOIN 
            satis sa ON s.sube_id = sa.sube_id
        WHERE 
            YEAR(sa.satis_tarih) = ?
        GROUP BY 
            s.sube_id
        ORDER BY 
            total_sales DESC;
    `;

    db.query(query, [year], (err, results) => {
        if (err) {
            console.error('En çok satış yapan şubeler sorgusunda hata:', err);
            return res.status(500).json({ error: 'Veri alınamadı.' });
        }
        res.json(results);
    });
});

// En az satış yapan şubeler (yıl parametresi ile)
router.get('/lowest-sales', (req, res) => {
    const { year } = req.query;
    if (!year) return res.status(400).json({ error: 'Yıl bilgisi gerekli.' });

    const query = `
        SELECT 
            s.sube_ad AS branch_name,
            SUM(sa.adet) AS total_sales
        FROM 
            sube s
        JOIN 
            satis sa ON s.sube_id = sa.sube_id
        WHERE 
            YEAR(sa.satis_tarih) = ?
        GROUP BY 
            s.sube_id
        ORDER BY 
            total_sales ASC
        LIMIT 10;
    `;

    db.query(query, [year], (err, results) => {
        if (err) {
            console.error('En az satış yapan şubeler sorgusunda hata:', err);
            return res.status(500).json({ error: 'Veri alınamadı.' });
        }
        res.json(results);
    });
});

module.exports = router;
