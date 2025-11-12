const express = require('express');
const router = express.Router();
const db = require('../models/db');

console.log("API router yüklendi");


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

// 🔹 Şubeleri listele
router.get('/subeler', (req, res) => {
    console.log("Şube listesi isteği geldi");
    const sql = `SELECT sube_id, sube_ad FROM sube ORDER BY sube_ad`;
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ error: 'Şube listesi alınamadı' });
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
    SELECT 
      i.ilce_ad,
      AVG(s.lat) AS lat,
      AVG(s.lon) AS lon,
      i.nufus2025
    FROM 
      ilce i
    JOIN 
      sube s ON i.ilce_id = s.ilce_id
    GROUP BY 
      i.ilce_ad, i.nufus2025;
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

// server/routes/tahminleme.js
router.get('/tahmin-veri', (req, res) => {
  const sql = `
    SELECT 
      k.kampanya_ad, 
      YEAR(k.baslangic_tarihi) AS yil, 
      SUM(u.fiyat * s.adet) AS toplam_gelir
    FROM satis s
    JOIN urun u ON s.urun_id = u.urun_id
    JOIN kampanya k ON s.kampanya_id = k.kampanya_id
    GROUP BY k.kampanya_ad, YEAR(k.baslangic_tarihi)
    ORDER BY yil;
  `;
  
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Tahmin verisi alınamadı:', err);
      return res.status(500).json({ message: 'Veri alınırken hata oluştu.' });
    }
    res.json(results);
  });
});


// 2️⃣ Kampanyalar arası toplam kazanç karşılaştırması
router.get('/kampanya-performans', (req, res) => {
    const { yil, sube1, sube2 } = req.query;

    if (!yil || !sube1 || !sube2) {
        return res.status(400).json({ error: "yil, sube1 ve sube2 parametreleri gerekli" });
    }

    const sql = `
        SELECT 
            k.kampanya_ad,
            SUM(CASE WHEN s.sube_id = ? THEN s.adet * u.fiyat ELSE 0 END) AS sube1_toplam,
            SUM(CASE WHEN s.sube_id = ? THEN s.adet * u.fiyat ELSE 0 END) AS sube2_toplam
        FROM satis s
        JOIN urun u ON s.urun_id = u.urun_id
        JOIN kampanya k ON s.kampanya_id = k.kampanya_id
        WHERE YEAR(s.satis_tarih) = ?
        GROUP BY k.kampanya_ad
        ORDER BY k.kampanya_ad;
    `;

    db.query(sql, [sube1, sube2, yil], (err, results) => {
        if (err) {
            console.error('Kampanya performans verisi alınamadı:', err);
            return res.status(500).json({ error: 'Veri alınamadı' });
        }
        res.json(results);
    });
});

module.exports = router;



