# Migration Rehberi - Soft Delete Özelliği

## Genel Bakış
Bu migration, mevcut hasta kayıtlarına soft delete özelliği ekler. Hastalar artık tamamen silinmez, sadece `isDeleted: true` olarak işaretlenir.

## Migration Adımları

### 1. Backend'i Yeniden Başlat
```bash
# Backend'i durdur (Ctrl+C)
# Sonra yeniden başlat
npm run dev
# veya
node src/server.js
```

### 2. Migration Script'ini Çalıştır
```bash
# Terminal'de backend klasöründe
node src/updateExistingPatients.js
```

### 3. Beklenen Çıktı
```
🔌 MongoDB'ye bağlanılıyor...
✅ MongoDB'ye bağlantı başarılı
📊 Toplam X hasta bulundu
🔄 X hasta güncellenecek
✅ Hasta güncellendi: [Hasta Adı] ([ID])
🎉 Tüm hastalar başarıyla güncellendi!
🔌 MongoDB bağlantısı kapatıldı
```

## Eklenen Alanlar

### Patient Model
- `isDeleted`: Boolean - Hasta silinmiş mi? (default: false)
- `isDeletedAt`: Date - Silinme tarihi (default: null)

### Yeni API Endpoint'leri
- `GET /api/patients/deleted` - Silinen hastaları listele
- `GET /api/patients/deleted/count` - Silinen hasta sayısını getir
- `PATCH /api/patients/:id/restore` - Hastayı geri getir
- `DELETE /api/patients/:id/permanent-delete` - Hastayı kalıcı olarak sil

## Değişiklikler

### Backend
- ✅ Patient model güncellendi
- ✅ Soft delete metodları eklendi
- ✅ Yeni API endpoint'leri eklendi
- ✅ Hasta silme işlemi soft delete olarak değiştirildi

### Frontend
- ✅ Geri dönüşüm kutusu bileşeni oluşturuldu
- ✅ Hasta listesi güncellendi
- ✅ Route'lar eklendi

## Test Etme

### 1. Hasta Silme
- Hasta listesinde bir hastayı sil
- Hasta geri dönüşüm kutusuna taşınmalı

### 2. Geri Dönüşüm Kutusu
- Hasta listesinde "Geri Dönüşüm Kutusu" butonuna tıkla
- Silinen hastalar görünmeli

### 3. Hasta Geri Getirme
- Geri dönüşüm kutusunda "Geri Getir" butonuna tıkla
- Hasta tekrar aktif listeye dönmeli

### 4. Kalıcı Silme
- Geri dönüşüm kutusunda "Kalıcı Sil" butonuna tıkla
- Hasta tamamen silinmeli

## Sorun Giderme

### Migration Hatası
```bash
# MongoDB bağlantı hatası
❌ Hata oluştu: MongoNetworkError: connect ECONNREFUSED 127.0.0.1:27017

# Çözüm: MongoDB'nin çalıştığından emin ol
mongod
```

### API Hatası
```bash
# 404 hatası
GET http://localhost:5000/api/patients/deleted 404 (Not Found)

# Çözüm: Backend'i yeniden başlat
npm run dev
```

### Veritabanı Hatası
```bash
# Schema hatası
❌ Hata oluştu: ValidationError: Path `isDeleted` is required.

# Çözüm: Migration script'ini çalıştır
node src/updateExistingPatients.js
```

## Güvenlik

- ✅ Kullanıcılar sadece kendi hastalarını silebilir/geri getirebilir
- ✅ Authentication gerekli
- ✅ Rate limiting aktif

## Performans

- ✅ Soft delete için optimize edilmiş sorgular
- ✅ Index'ler mevcut
- ✅ Lazy loading

## Notlar

- **Önemli**: Migration script'ini çalıştırmadan önce veritabanını yedekleyin
- Soft delete edilen hastalar geri getirilebilir
- Kalıcı silme işlemi geri alınamaz
- Tüm işlemler loglanır

---

**Migration tamamlandıktan sonra geri dönüşüm kutusu özelliği kullanıma hazır olacaktır! 🎉**
