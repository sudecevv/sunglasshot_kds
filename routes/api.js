const express = require('express');
const router = express.Router();
const db = require('../models/db');


const config = require("../config/config.js");




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

router.get('/kampanya-karlar', (req, res) => {
  const sql = `
    SELECT 
      k.kampanya_id,
      k.kampanya_ad,
      YEAR(k.baslangic_tarihi) AS yil,
      COALESCE(SUM(s.adet * u.fiyat), 0) - 
      COALESCE(SUM(sm.masraf), 0) AS toplam_kar
    FROM kampanya k
    LEFT JOIN satis s ON s.kampanya_id = k.kampanya_id
    LEFT JOIN urun u ON s.urun_id = u.urun_id
    LEFT JOIN sube_masraf sm ON s.sube_id = sm.sube_id
    GROUP BY k.kampanya_id, k.kampanya_ad, YEAR(k.baslangic_tarihi)
    ORDER BY yil ASC, k.kampanya_ad ASC;
  `;

  db.query(sql, (err, results) => {
    if (err) {
      console.error('❌ Kampanya karları hatası:', err);
      return res.status(500).json({ error: 'Veri alınamadı' });
    }
    console.log("✅ Kampanya karları verisi:", results);
    res.json(results);
  });
});


// // 🔹 Şube bazlı aylık kar analizi
// router.get("/sube-aylik-kar", (req, res) => {
//   const { yil, sube_id } = req.query;

//   const sql = `
//     SELECT 
//       MONTH(s.satis_tarih) AS ay,
//       SUM(s.adet * u.fiyat) - COALESCE(SUM(sm.masraf), 0) AS kar
//     FROM satis s
//     JOIN urun u ON s.urun_id = u.urun_id
//     LEFT JOIN sube_masraf sm 
//       ON sm.sube_id = s.sube_id 
//       AND YEAR(sm.masraf_tarihi) = ?
//       AND MONTH(sm.masraf_tarihi) = MONTH(s.satis_tarih)
//     WHERE YEAR(s.satis_tarih) = ?
//       AND s.sube_id = ?
//     GROUP BY MONTH(s.satis_tarih)
//     ORDER BY ay ASC;
//   `;

//   db.query(sql, [yil, yil, sube_id], (err, results) => {
//     if (err) {
//       console.error("❌ Şube aylık kar verisi hatası:", err);
//       return res.status(500).json({ error: "Veri alınamadı" });
//     }
//     res.json(results);
//   });
// });

// // 🔹 Şubeleri listelemek için
// router.get("/subeler", (req, res) => {
//   const sql = "SELECT sube_id, sube_ad FROM sube ORDER BY sube_ad ASC;";
//   db.query(sql, (err, results) => {
//     if (err) {
//       console.error("❌ Şubeler hatası:", err);
//       return res.status(500).json({ error: "Veri alınamadı" });
//     }
//     res.json(results);
//   });
// });

// // 🔹 Yıllara göre şubelerin toplam karları
// router.get("/sube-toplam-kar", (req, res) => {
//   const { yil } = req.query;

//   const sql = `
//     SELECT 
//       s.sube_id,
//       sube.sube_ad,
//       SUM(s.adet * u.fiyat) - COALESCE(SUM(sm.masraf), 0) AS toplam_kar
//     FROM satis s
//     JOIN urun u ON s.urun_id = u.urun_id
//     JOIN sube ON s.sube_id = sube.sube_id
//     LEFT JOIN sube_masraf sm 
//       ON sm.sube_id = s.sube_id 
//       AND YEAR(sm.masraf_tarihi) = ?
//     WHERE YEAR(s.satis_tarih) = ?
//     GROUP BY s.sube_id, sube.sube_ad
//     ORDER BY toplam_kar DESC;
//   `;

//   db.query(sql, [yil, yil], (err, results) => {
//     if (err) {
//       console.error("❌ Şube toplam kar hatası:", err);
//       return res.status(500).json({ error: "Veri alınamadı" });
//     }
//     res.json(results);
//   });
// });

// 🔹 Şubenin aylara göre karı
// router.get("/sube-aylik-kar", (req, res) => {
//     const { yil, sube_id } = req.query;

//     const sql = `
//         SELECT 
//             MONTH(s.satis_tarih) AS ay,
//             SUM(s.adet * u.fiyat) - COALESCE(SUM(sm.masraf), 0) AS kar
//         FROM satis s
//         JOIN urun u ON s.urun_id = u.urun_id
//         LEFT JOIN sube_masraf sm 
//             ON sm.sube_id = s.sube_id 
//             AND YEAR(sm.masraf_tarihi) = ?
//             AND MONTH(sm.masraf_tarihi) = MONTH(s.satis_tarih)
//         WHERE YEAR(s.satis_tarih) = ?
//           AND s.sube_id = ?
//         GROUP BY MONTH(s.satis_tarih)
//         ORDER BY ay ASC;
//     `;

//     db.query(sql, [yil, yil, sube_id], (err, results) => {
//         if (err) return res.status(500).json({ error: "Veri alınamadı" });
//         res.json(results);
//     });
// });
// 🔹 Şubenin aylara göre kar (düzeltildi)
router.get("/sube-aylik-kar", (req, res) => {
    const { yil, sube_id } = req.query;

    const sql = `
        SELECT 
            MONTH(s.satis_tarih) AS ay,
            SUM(s.adet * u.fiyat) - COALESCE(sm.toplam_masraf, 0) AS kar
        FROM satis s
        JOIN urun u ON s.urun_id = u.urun_id
        LEFT JOIN (
            SELECT 
                sube_id,
                YEAR(masraf_tarihi) AS yil,
                MONTH(masraf_tarihi) AS ay,
                SUM(masraf) AS toplam_masraf
            FROM sube_masraf
            GROUP BY sube_id, yil, ay
        ) sm 
        ON sm.sube_id = s.sube_id 
           AND sm.yil = YEAR(s.satis_tarih) 
           AND sm.ay = MONTH(s.satis_tarih)
        WHERE YEAR(s.satis_tarih) = ?
          AND s.sube_id = ?
        GROUP BY MONTH(s.satis_tarih)
        ORDER BY ay ASC;
    `;

    db.query(sql, [yil, sube_id], (err, results) => {
        if (err) return res.status(500).json({ error: "Veri alınamadı" });
        res.json(results);
    });
});

/* ==========================================================
   🔹 Yıllara göre şubelerin toplam karları
========================================================== */
router.get("/sube-toplam-kar", (req, res) => {
    const { yil } = req.query;

    const sql = `
        SELECT 
            s.sube_id,
            sb.sube_ad,
            SUM(s.adet * u.fiyat) 
                - COALESCE((
                    SELECT SUM(m.masraf)
                    FROM sube_masraf m
                    WHERE m.sube_id = s.sube_id
                      AND YEAR(m.masraf_tarihi) = ?
                ), 0) AS toplam_kar
        FROM satis s
        JOIN urun u ON s.urun_id = u.urun_id
        JOIN sube sb ON s.sube_id = sb.sube_id
        WHERE YEAR(s.satis_tarih) = ?
        GROUP BY s.sube_id, sb.sube_ad
        ORDER BY toplam_kar DESC;
    `;

    db.query(sql, [yil, yil], (err, results) => {
        if (err) return res.status(500).json({ error: "Veri alınamadı" });
        res.json(results);
    });
});
/* ==========================================================
   🔹 İlçe puanlarını ilçe_analiz tablosundan hesaplayan API
========================================================== */
router.get("/ilce-puanlari", (req, res) => {
    const sql = `
        SELECT 
            ilce_ad,
            sube_sayisi,
            rakip_durumu,
            nufus_durumu,
            gelir_durumu
        FROM ilce_analiz
    `;

    db.query(sql, (err, rows) => {
        if (err) {
            console.error("İlçe analiz verisi alınamadı:", err);
            return res.status(500).json({ error: "Veri alınamadı" });
        }

        function mapValue(value, type = "normal") {
            const map = {
                "Yüksek": type === "ters" ? 40 : 100,
                "Orta": 70,
                "Düşük": type === "ters" ? 100 : 40
            };
            return map[value] || 0;
        }

        const puanlar = rows.map(r => {
            const gelir = mapValue(r.gelir_durumu);
            const nufus = mapValue(r.nufus_durumu);
            const rakip = mapValue(r.rakip_durumu, "ters"); // ters mantık
            const sube_bonus = Math.min(r.sube_sayisi * 10, 10);

            const toplamPuan =
                gelir * 0.40 +
                nufus * 0.30 +
                rakip * 0.20 +
                sube_bonus;

            return {
                ilce_ad: r.ilce_ad,
                puan: Number(toplamPuan.toFixed(1))
            };
        });

        puanlar.sort((a, b) => b.puan - a.puan);

        res.json(puanlar);
    });
});
// -------------------------------------------
//  İLÇE PUANLARI API (Dinamik Hesaplama)
// -------------------------------------------
router.get("/ilce-puanlari", (req, res) => {

    const sql = `
        SELECT 
            i.ilce_id,
            i.ilce_ad,
            i.nufus2025,
            COUNT(s.sube_id) AS sube_sayisi
        FROM ilce i
        LEFT JOIN sube s ON s.ilce_id = i.ilce_id
        GROUP BY i.ilce_id, i.ilce_ad, i.nufus2025
        ORDER BY sube_sayisi DESC;
    `;

    db.query(sql, (err, results) => {
        if (err) {
            console.error("İlçe puanları çekilirken hata:", err);
            return res.status(500).json({ message: "Sunucu hatası" });
        }

        // --------------------------
        // PUAN HESAPLAMA ALGORİTMASI
        // --------------------------
        const data = results.map(item => {
            let puan = 0;

            // Şube sayısı (0–20 arası)
            puan += (item.sube_sayisi * 10);

            // Nüfus (örnek skala)
            if (item.nufus2025 > 400000) puan += 40;
            else if (item.nufus2025 > 250000) puan += 30;
            else if (item.nufus2025 > 150000) puan += 20;
            else puan += 10;

            if (puan > 100) puan = 100;

            return {
                ilce: item.ilce_ad,
                sube_sayisi: item.sube_sayisi,
                nufus: item.nufus2025,
                puan: puan
            };
        });

        res.json(data);
    });
});



module.exports = router;



