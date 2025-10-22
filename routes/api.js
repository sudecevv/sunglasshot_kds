const express = require('express');
const router = express.Router();
const db = require('../config/config');


router.post('/login', (req, res) => {
  const { kullanici_adi, sifre } = req.body || {};

  if (!kullanici_adi || !sifre) {
    return res.status(400).json({ message: 'Kullanıcı adı ve şifre gerekli.' });
  }

  const query = 'SELECT * FROM kullanicilar WHERE kullanici_adi = ? AND sifre = ?';
  db.execute(query, [kullanici_adi, sifre], (err, results) => {
    if (err) {
      console.error('Veritabanı hatası:', err);
      return res.status(500).json({ message: 'Bir sunucu hatası oluştu.' });
    }

    if (results.length > 0) {
      return res.json({ message: 'Giriş başarılı.', user: results[0] });
    } else {
      return res.status(401).json({ message: 'Kullanıcı adı veya şifre yanlış.' });
    }
  });
});


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



router.get('/campaign-performance', (req, res) => {
    const { year } = req.query;

    const query = `
        SELECT 
            k.kampanya_ad AS campaign_name,
            SUM(s.adet * u.fiyat) AS total_earnings
        FROM 
            satis s
        JOIN 
            urun u ON s.urun_id = u.urun_id
        JOIN 
            kampanya k ON s.kampanya_id = k.kampanya_id
        WHERE 
            YEAR(s.satis_tarih) = ?
        GROUP BY 
            k.kampanya_id
        ORDER BY 
            total_earnings DESC;
    `;

    db.execute(query, [year], (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ error: 'Veritabanı hatası.' });
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
            total_sales DESC
        LIMIT 10;
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

// Şubeleri al
router.get('/branches', (req, res) => {
    const query = 'SELECT sube_id, sube_ad FROM sube';

    db.query(query, (err, results) => {
        if (err) {
            console.error('Şubeler sorgusunda hata:', err);
            return res.status(500).json({ error: 'Veri alınamadı.' });
        }
        res.json(results);  // Şubeleri döndür
    });
});


router.get('/sales', (req, res) => {
    const { year, branch } = req.query;

    if (!year || !branch) {
        return res.status(400).json({ error: 'Yıl ve şube bilgisi gerekli.' });
    }

    const query = `
        SELECT
            month,  -- Ay bilgisi
            total_sales,  -- Toplam satış fiyatı
            total_expenses,  -- Toplam masraf
            total_sales - total_expenses AS profit  -- Aylık kar
        FROM (
            SELECT
                MONTH(satis.satis_tarih) AS month,  -- Ay bilgisi
                SUM(satis.adet * urun.fiyat) AS total_sales,  -- Toplam satış fiyatı
                (SELECT SUM(COALESCE(sube_masraf.masraf, 0))
                 FROM sube_masraf
                 WHERE YEAR(sube_masraf.masraf_tarihi) = ? 
                   AND MONTH(sube_masraf.masraf_tarihi) = MONTH(satis.satis_tarih)
                   AND sube_masraf.sube_id = ?) AS total_expenses
            FROM
                satis
            JOIN urun ON satis.urun_id = urun.urun_id
            WHERE
                YEAR(satis.satis_tarih) = ?  -- Yıl filtresi
                AND satis.sube_id = ?  -- Şube filtresi
            GROUP BY
                MONTH(satis.satis_tarih)
        ) AS monthly_data
        ORDER BY
            month;
    `;

    db.query(query, [year, branch, year, branch], (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ error: 'Veri alınamadı.' });
        }

        res.json(results);
    });
});





router.get('/annual-profit', (req, res) => {
    const { year } = req.query;

    if (!year) return res.status(400).json({ error: 'Yıl bilgisi gerekli.' });

    const query = `
        SELECT
            yil,  -- YIL bilgisi
            sube.sube_ad AS branch_name,  -- Şube adı
            total_sales,  -- Toplam satış fiyatı
            total_expenses,  -- Toplam masraf
            total_sales - total_expenses AS profit  -- yıllık kar
        FROM (
            SELECT
                YEAR(satis.satis_tarih) AS yil,  -- yıl bilgisi
                satis.sube_id,
                SUM(satis.adet * urun.fiyat) AS total_sales,  -- Toplam satış fiyatı
                -- Toplam masrafı yıl ve şube bazında gruplayarak alıyoruz
                (SELECT SUM(COALESCE(sube_masraf.masraf, 0))
                 FROM sube_masraf
                 WHERE YEAR(sube_masraf.masraf_tarihi) = ? 
                   AND YEAR(sube_masraf.masraf_tarihi) = YEAR(satis.satis_tarih)
                   AND sube_masraf.sube_id = satis.sube_id) AS total_expenses
            FROM
                satis
            JOIN urun ON satis.urun_id = urun.urun_id
            WHERE
                YEAR(satis.satis_tarih) = ?  -- Yıl filtresi
            GROUP BY
                satis.sube_id, YEAR(satis.satis_tarih)  -- Şube bazında ve yıl bazında gruplayarak toplam satış ve masrafı hesapla
        ) AS yearly_data
        JOIN sube ON yearly_data.sube_id = sube.sube_id  -- Şube adı için sube tablosu ile ilişki kuruyoruz
        ORDER BY
            profit DESC;
    `;

    db.query(query, [year, year], (err, results) => {
        if (err) {
            console.error('Yıllık kar sorgusunda hata:', err);
            return res.status(500).json({ error: 'Veri alınamadı.' });
        }

        res.json(results);  // Sonuçları geri döndür
    });
});


router.get('/branches', (req, res) => {
    const query = `SELECT sube_ad, lat, lon, SUM(satis.adet) AS total_sales
                   FROM sube
                   JOIN satis ON sube.sube_id = satis.sube_id
                   WHERE YEAR(satis.satis_tarih) = 2024
                   GROUP BY sube.sube_id, sube_ad, lat, lon`;

    db.query(query, (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).json({ error: 'Veri alınamadı.' });
        }

        
        const validResults = results.filter(branch => branch.lat && branch.lon && !isNaN(branch.lat) && !isNaN(branch.lon));
        
        res.json(validResults);
    });
});

router.get("/campaign-profits", async (req, res) => {
    const year = req.query.year || 2025;
    const month = req.query.month; // Ay bilgisi
    const campaignId = req.query.campaign_id; // Kampanya ID'si

    try {
        const campaignQuery = `
            SELECT 
                k.kampanya_ad, 
                SUM(u.fiyat * s.adet) AS toplam_gelir, 
                (SUM(u.fiyat * s.adet) - 
                    (SELECT SUM(masraf) 
                     FROM atasun_kds.sube_masraf 
                     WHERE masraf_tarihi BETWEEN k.baslangic_tarihi AND k.bitis_tarihi)) AS kar
            FROM 
                atasun_kds.satis s
            JOIN 
                atasun_kds.kampanya k ON s.kampanya_id = k.kampanya_id
            JOIN 
                atasun_kds.urun u ON s.urun_id = u.urun_id
            WHERE 
                YEAR(s.satis_tarih) = ?
                AND MONTH(s.satis_tarih) = ?
                AND s.kampanya_id = ?
            GROUP BY 
                k.kampanya_id
        `;

        const [results] = await db.execute(campaignQuery, [year, month, campaignId]);

        if (!results || results.length === 0) {
            console.log("Veri bulunamadı");
            return res.status(404).json({ error: "Veri bulunamadı" });
        }

        res.json(results);
    } catch (error) {
        console.error("API Hatası:", error);
        res.status(500).json({ error: "API hatası" });
    }
});

router.get('/campaigns', (req, res) => {
    const query = `
        SELECT kampanya_id, kampanya_ad 
        FROM kampanya
        WHERE kampanya_ad IN ('2 al 1 öde', '3 al 2 öde')
    `;
    db.query(query, (err, results) => {
        if (err) return res.status(500).send(err);
        res.json(results);
    });
});


router.post('/predict', (req, res) => {
    const { campaignId, month } = req.body;

    
    const growthRates = {
        1: 0.04, // Ocak
        2: 0.01, // Şubat
        3: 0.03, // Mart
        4: 0.04, // Nisan
        5: 0.05, // Mayıs
        6: 0.02, // Haziran
        7: 0.06, // Temmuz
        8: 0.03, // Ağustos
        9: 0.05, // Eylül
        10: 0.07, // Ekim
        11: 0.04, // Kasım
        12: 0.03  // Aralık
    };

    const query = `
        SELECT 
            YEAR(s.satis_tarih) AS year,
            SUM(s.adet * u.fiyat) AS total_earnings
        FROM 
            satis s
        JOIN 
            urun u ON s.urun_id = u.urun_id
        WHERE 
            s.kampanya_id = ?
        GROUP BY 
            YEAR(s.satis_tarih)
        ORDER BY 
            YEAR(s.satis_tarih) ASC;
    `;

    db.query(query, [campaignId], (err, results) => {
        if (err) {
            console.error('Veritabanı hatası:', err);
            return res.status(500).send({ error: 'Veritabanı hatası oluştu.' });
        }

        console.log('Sorgu sonuçları:', results);

        // Eğer sonuç yoksa varsayılan bir tahmin yap
        if (results.length === 0) {
            const defaultPrediction = 10000; // Varsayılan bir tahmin
            return res.json({ predicted2026: defaultPrediction });
        }

        // Geçmiş yılların toplam kazancını kullanarak tahmin yap
        const lastYearEarnings = parseFloat(results[results.length - 1].total_earnings) || 0;

        // Seçilen aya uygun büyüme oranı
        const growthRate = growthRates[month] || 0.05; // Eğer ay seçilmemişse varsayılan %5

        // 2026 yılı için tahmin
        const predicted2026 = lastYearEarnings * (1 + growthRate);

        res.json({ predicted2026 });
    });
});







module.exports = router;