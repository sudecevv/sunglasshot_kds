# sunglasshot_kds
## Proje Açıklaması
Bu proje, Sunglass Hot firması için geliştirilmiş bir Karar Destek Sistemi (KDS) uygulamasıdır.
Sistem; kampanya, ürün, şube ve satış verilerini analiz ederek orta ve üst düzey yöneticilerin
stratejik karar alma süreçlerini desteklemeyi amaçlamaktadır.

Uygulama sayesinde yöneticiler:
Kampanyaların satışlara olan etkisini analiz edebilir
Şube bazlı performans karşılaştırmaları yapabilir
Bölgesel nüfus verileri ile satış ilişkisini inceleyebilir
Geçmiş veriler üzerinden daha sağlıklı kararlar alabilir

## Senaryo
Sunglass Hot firması, Türkiye genelinde farklı il ve ilçelerde bulunan şubelerinde
çeşitli kampanyalar uygulamaktadır. Firma yönetimi, bu kampanyaların satış performansına
olan etkisini analiz etmek ve gelecekte uygulanacak kampanya stratejilerini belirlemek istemektedir.

Bu sistemde:
Kampanyalar oluşturulur ve yönetilir
Ürün satışları şube ve kampanya bazında kaydedilir
Satış verileri analiz edilerek yöneticilere anlamlı çıktılar sunulur
Geçmiş kampanya ve satış verilerinin tutarlılığı korunur

## CRUD İşlemleri
Proje kapsamında Kampanya entity’si üzerinden CRUD işlemleri gerçekleştirilmiştir.

Kampanya CRUD İşlemleri:
Create: Yeni kampanya ekleme
Read: Kampanyaları listeleme
Update: Kampanya bilgilerini güncelleme
Delete: Kampanya silme
CRUD işlemleri RESTful API yapısı kullanılarak backend tarafında geliştirilmiştir.

## İş Kuralları
Proje kapsamında, veri tutarlılığını korumak ve karar destek sisteminin güvenilirliğini artırmak
amacıyla backend tarafında iki adet iş kuralı uygulanmıştır.

İş Kuralı 1
Bitiş tarihi geçmiş kampanyalar sistemden silinemez.

Bu kural, geçmiş kampanya verilerinin silinerek rapor ve analiz sonuçlarının
bozulmasını engellemek amacıyla uygulanmıştır.

İş Kuralı 2
Bitiş tarihi geçmiş kampanyalar güncellenemez.
Kampanyalar yalnızca aktif oldukları süre boyunca güncellenebilir.
Geçmiş kampanyalar sadece görüntülenebilir.

İş kuralları, backend tarafında kampanya route dosyası içerisinde
PUT ve DELETE işlemleri sırasında kontrol edilmektedir.

## Kurulum
Proje bilgisayara klonlanır
Gerekli paketler yüklenir:
npm install
.env dosyası oluşturulur ve veritabanı bilgileri girilir
Proje çalıştırılır:
npm start
Uygulama tarayıcı üzerinden görüntülenir

## API Endpoint Listesi
Kampanya API’leri
GET /api/kampanya
→ Tüm kampanyaları listeler
POST /api/kampanya
→ Yeni kampanya ekler
PUT /api/kampanya/:id
→ Kampanya bilgilerini günceller
(İş kuralı uygulanır)
DELETE /api/kampanya/:id
→ Kampanya siler
### Genel Veri Endpoint’i
- GET /api/data/:table  
  → İstenilen tablodaki tüm verileri listeler
### Satış ve Şube Performans Analizleri

- GET /api/top-sales?year=YYYY  
  → Yıl bazlı en çok satış yapan şubeler

- GET /api/top-sales-all-years  
  → Tüm yıllara göre şube satış performansı

- GET /api/sube-kategori-performans?year=YYYY  
  → Şube bazlı kategori satış performansı

- GET /api/subeler  
  → Şube listesini getirir
### Harita Tabanlı Analizler

- GET /api/satis-harita  
  → Şube bazlı satış yoğunluğu harita verisi

- GET /api/nufus-harita  
  → İlçe bazlı nüfus yoğunluğu harita verisi
### Kampanya Analizleri

- GET /api/kampanya-gelirleri  
  → Kampanya bazlı toplam gelir analizi

- GET /api/kampanya-listesi  
  → Kampanya listeleme

- GET /api/kampanya-oncesi-sonrasi?kampanya_id=X  
  → Kampanya öncesi ve sonrası satış karşılaştırması

- GET /api/kampanya-kpi?kampanya_id=X  
  → Kampanya KPI ve ciro analizi

- GET /api/tahmin-veri  
  → Kampanya bazlı yıllık gelir tahmin verisi

- GET /api/kampanya-performans?yil=YYYY&sube1=A&sube2=B  
  → İki şube arasında kampanya performans karşılaştırması
### Kâr Analizleri

- GET /api/sube-aylik-kar?yil=YYYY&sube_id=X  
  → Şube bazlı aylık kâr analizi

- GET /api/sube-toplam-kar?yil=YYYY  
  → Yıl bazlı şube toplam kâr analizi
### İlçe Bazlı Karar Destek Analizleri

- GET /api/ilce-puanlari  
  → İlçe bazlı puanlama ve şube açma uygunluk analizi


## ER Diyagramı
Proje kapsamında kullanılan veritabanı yapısı aşağıdaki ER diyagramında gösterilmiştir.
![ER Diagram][def]

[def]: erdiyagram.png

### ER Diyagramı Açıklaması

Sistemde kampanya, ürün, şube ve satış tabloları merkezi yapıyı oluşturmaktadır.
Satış tablosu; şube, ürün ve kampanya tabloları ile ilişkilendirilerek
kampanyaların satışlara olan etkisinin analiz edilmesi sağlanmıştır.
İl ve ilçe tabloları, şubelerin konumsal analizlerinin yapılabilmesi amacıyla
tasarlanmıştır.

## .env.example dosyası
PORT=3000

DB_HOST=localhost
DB_USER=root
DB_PASSWORD=
DB_NAME=sunglasshot_kds
