# sunglasshot_kds
## Proje Açıklaması
Bu proje, Sunglass Hot firması için geliştirilmiş bir Karar Destek Sistemi (KDS) uygulamasıdır.
Sistem, kampanya, şube ve satış verilerini analiz ederek yöneticilerin karar alma
süreçlerini desteklemeyi amaçlamaktadır.
## Senaryo
Sunglass Hot firması, farklı şubelerde uygulanan kampanyaların satışlara olan etkisini
analiz etmek istemektedir. Bu sistem sayesinde yöneticiler kampanyaları yönetebilir,
satış performanslarını inceleyebilir ve stratejik kararlar alabilir.
## CRUD İşlemleri
Proje kapsamında Kampanya entity’si üzerinden CRUD işlemleri gerçekleştirilmiştir.

- Create: Yeni kampanya ekleme
- Read: Kampanyaları listeleme
- Update: Kampanya bilgilerini güncelleme
- Delete: Kampanya silme

CRUD işlemleri RESTful API mimarisi kullanılarak backend tarafında geliştirilmiştir.
## İş Kuralları

1. Bitiş tarihi geçmiş kampanyalar sistemden silinemez.
   Bu iş kuralı, geçmiş verilerin rapor tutarlılığını korumak amacıyla
   backend tarafında uygulanmaktadır.

2. Bitiş tarihi geçmiş kampanyalar güncellenemez.
   Kampanyalar yalnızca aktif oldukları süre boyunca güncellenebilir.
## Kurulum

1. Proje klonlanır
2. Gerekli paketler yüklenir:
   npm install
3. .env dosyası oluşturulur ve veritabanı bilgileri girilir
4. Proje çalıştırılır:
   npm start
## API Endpoint Listesi

- GET /api/kampanya → Kampanya listesi
- POST /api/kampanya → Yeni kampanya ekleme
- PUT /api/kampanya/:id → Kampanya güncelleme
- DELETE /api/kampanya/:id → Kampanya silme
## ER Diyagramı
Proje kapsamında kullanılan veritabanı yapısı aşağıdaki ER diyagramında gösterilmiştir.
![ER Diagram][def]

[def]: er_diagram.png

### ER Diyagramı Açıklaması

Sistemde kampanya, ürün, şube ve satış tabloları merkezi yapıyı oluşturmaktadır.
Satış tablosu; şube, ürün ve kampanya tabloları ile ilişkilendirilerek
kampanyaların satışlara olan etkisinin analiz edilmesi sağlanmıştır.
İl ve ilçe tabloları, şubelerin konumsal analizlerinin yapılabilmesi amacıyla
tasarlanmıştır.