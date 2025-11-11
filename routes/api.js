const express = require('express');
const router = express.Router();
const db = require('../models/db');

// 🔹 Belirtilen tablodaki tüm verileri döndür (genel amaçlı endpoint)
router.get('/data/:table', (req, res) => {
  const tableName = req.params.table;

  if (!tableName) {
    return res.status(400).json({ message: 'Tablo adı gerekli.' });
  }

  const query = `SELECT * FROM ??`;
  db.execute(query, [tableName], (err, results) => {
    if (err) {
      console.error('❌ Veritabanı hatası:', err);
      return res.status(500).json({ message: 'Bir sunucu hatası oluştu.' });
    }

    res.json(results);
  });
});


// 🔹 En çok satış yapan şubeler (yıl parametresiyle)
router.get('/top-sales', (req, res) => {
  const { year } = req.query;

  if (!year) return res.status(400).json({ error: 'Yıl bilgisi gerekli.' });

  const query = `
    SELECT 
      s.sube_ad AS sube_ad,
      SUM(sa.adet) AS toplam_satis
    FROM 
      satis sa
    JOIN 
      sube s ON sa.sube_id = s.sube_id
    WHERE 
      YEAR(sa.satis_tarih) = ?
    GROUP BY 
      s.sube_id
    ORDER BY 
      toplam_satis DESC;
  `;

  db.query(query, [year], (err, results) => {
    if (err) {
      console.error('❌ En çok satış yapan şubeler sorgusunda hata:', err);
      return res.status(500).json({ error: 'Veri alınamadı.' });
    }
    console.log(`✅ ${year} yılı en çok satan şubeler:`, results.length);
    res.json(results);
  });
});


// 🔹 Ürün kategorisine göre şube satış performansı
router.get('/sube-kategori-performans', (req, res) => {
  const { year } = req.query;
  if (!year) return res.status(400).json({ error: 'Yıl bilgisi gerekli.' });

  const query = `
    SELECT 
      s.sube_ad AS sube_ad,
      k.kategori_ad AS kategori_ad,
      SUM(sa.adet) AS toplam_satis
    FROM 
      satis sa
    JOIN 
      sube s ON sa.sube_id = s.sube_id
    JOIN 
      urun u ON sa.urun_id = u.urun_id
    JOIN 
      kategori k ON u.kategori_id = k.kategori_id
    WHERE 
      YEAR(sa.satis_tarih) = ?
    GROUP BY 
      s.sube_ad, k.kategori_ad
    ORDER BY 
      s.sube_ad, k.kategori_ad;
  `;

  db.query(query, [year], (err, results) => {
    if (err) {
      console.error('❌ Ürün kategorisine göre şube performansı sorgusunda hata:', err);
      return res.status(500).json({ error: err.sqlMessage });
    }
    console.log(`✅ ${year} yılı kategori bazlı satış performansı:`, results.length);
    res.json(results);
  });
});

// 🧭 Satış Haritası
router.get("/satis-harita", (req, res) => {
  const sql = `
    SELECT s.sube_ad, s.lat, s.lon, SUM(sa.adet) AS toplam_satis
    FROM satis sa
    JOIN sube s ON sa.sube_id = s.sube_id
    GROUP BY s.sube_id;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Satış harita hatası:", err);
      res.status(500).json({ error: "Satış harita verisi alınamadı" });
    } else res.json(results);
  });
});


// 👥 Nüfus Haritası
router.get("/nufus-harita", (req, res) => {
  const sql = `
    SELECT ilce_ad, lat, lon, nufus2025
    FROM ilce;
  `;
  db.query(sql, (err, results) => {
    if (err) {
      console.error("❌ Nüfus harita hatası:", err);
      res.status(500).json({ error: "Nüfus harita verisi alınamadı" });
    } else res.json(results);
  });
});

// Kampanyalara göre toplam kazanç
router.get('/kampanya-gelirleri', (req, res) => {
  const sql = `
    SELECT k.kampanya_id,
           k.kampanya_ad,
           DATE_FORMAT(k.baslangic_tarihi, '%Y.%m.%d') AS baslangic,
           DATE_FORMAT(k.bitis_tarihi, '%Y.%m.%d') AS bitis,
           COALESCE(SUM(sa.adet * u.fiyat), 0) AS toplam_kazanc
    FROM kampanya k
    LEFT JOIN satis sa ON k.kampanya_id = sa.kampanya_id
    LEFT JOIN urun u ON sa.urun_id = u.urun_id
    GROUP BY k.kampanya_id, k.kampanya_ad,k.baslangic_tarihi, k.bitis_tarihi
    ORDER BY toplam_kazanc DESC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ /kampanya-gelirleri hatası:', err);
      return res.status(500).json({ error: 'Veri alınamadı.' });
    }
    // results: [{kampanya_id, kampanya_ad, toplam_kazanc}, ...]
    res.json(results);
  });
});

module.exports = router;
