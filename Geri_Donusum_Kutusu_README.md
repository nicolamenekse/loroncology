# Geri Dönüşüm Kutusu Özelliği

## Genel Bakış
Bu özellik, silinen hasta kayıtlarını geri getirmenizi ve kalıcı olarak silmenizi sağlar. Hasta kayıtları silindiğinde tamamen kaybolmaz, geri dönüşüm kutusunda saklanır.

## Özellikler

### 🔍 Silinen Hastaları Görüntüleme
- Silinen tüm hasta kayıtlarını listeler
- Hasta adı ile arama yapabilme
- Tür (Kedi/Köpek) filtreleme
- Silinme tarihine göre sıralama
- İsim alfabetik sıralama

### 🔄 Hasta Geri Getirme
- Silinen hastaları tek tıkla geri getirme
- Hasta tüm bilgileriyle birlikte geri yüklenir
- Geri getirme işlemi onay dialog'u ile güvenli

### 🗑️ Kalıcı Silme
- Geri dönüşüm kutusundaki hastaları kalıcı olarak silme
- Uyarı dialog'u ile güvenlik
- Bu işlem geri alınamaz

### 📊 Görsel Özellikler
- Silinen hasta sayısını gösteren badge
- Hasta kartlarında silinme tarihi bilgisi
- Kırmızı üst çizgi ile silinen hasta görsel ayrımı
- Responsive tasarım

## Kullanım

### Geri Dönüşüm Kutusuna Erişim
1. Hasta listesi sayfasında "Geri Dönüşüm Kutusu" butonuna tıklayın
2. Buton üzerinde silinen hasta sayısı badge olarak görünür

### Hasta Geri Getirme
1. Geri dönüşüm kutusunda geri getirmek istediğiniz hastayı bulun
2. "Geri Getir" butonuna tıklayın
3. Onay dialog'unda "Geri Getir" butonuna tıklayın
4. Hasta başarıyla geri getirilir ve hasta listesinde görünür

### Kalıcı Silme
1. Geri dönüşüm kutusunda kalıcı olarak silmek istediğiniz hastayı bulun
2. "Kalıcı Sil" butonuna tıklayın
3. Uyarı dialog'unda "Kalıcı Olarak Sil" butonuna tıklayın
4. Hasta kalıcı olarak silinir ve geri getirilemez

## Teknik Detaylar

### API Endpoints
- `GET /api/patients/deleted` - Silinen hastaları listele
- `GET /api/patients/deleted/count` - Silinen hasta sayısını getir
- `PATCH /api/patients/:id/restore` - Hastayı geri getir
- `DELETE /api/patients/:id/permanent-delete` - Hastayı kalıcı olarak sil

### State Yönetimi
- Silinen hasta listesi
- Geri getirme dialog durumu
- Kalıcı silme dialog durumu
- Başarı/hata mesajları
- Yükleme durumu

### Güvenlik
- Tüm işlemler için authentication gerekli
- Kalıcı silme için ek onay
- API rate limiting

## Stil Özellikleri

### Genel Tasarım
- Facebook tarzı modern tasarım
- CSS değişkenleri kullanımı
- Responsive grid layout
- Material-UI bileşenleri

### Renk Paleti
- Ana mavi: `var(--facebook-blue)`
- Arka plan: `var(--facebook-light-gray)`
- Kartlar: `var(--facebook-white)`
- Kenarlıklar: `var(--facebook-border)`
- Gölgeler: `var(--facebook-shadow)`

### Responsive Tasarım
- Mobil uyumlu
- Tablet ve desktop optimizasyonu
- Esnek grid sistemi
- Touch-friendly butonlar

## Gelecek Geliştirmeler

### Planlanan Özellikler
- Toplu geri getirme
- Toplu kalıcı silme
- Silinme nedeni kaydetme
- Otomatik temizleme (belirli süre sonra)
- E-posta bildirimleri
- Audit log

### Performans İyileştirmeleri
- Lazy loading
- Virtual scrolling
- Debounced search
- Caching
- Background sync

## Sorun Giderme

### Yaygın Sorunlar
1. **Hasta geri getirilemiyor**: API bağlantısını kontrol edin
2. **Silinen hasta görünmüyor**: Sayfa yenileyin
3. **Badge sayısı güncellenmiyor**: Sayfa yenileyin

### Log Kontrolü
- Browser console'da hata mesajlarını kontrol edin
- Network tab'ında API çağrılarını izleyin
- LocalStorage'da token'ın geçerli olduğundan emin olun

## Destek

Herhangi bir sorun yaşarsanız:
1. Browser console'u kontrol edin
2. Network sekmesinde API çağrılarını izleyin
3. Geliştirici ekibiyle iletişime geçin

---

**Not**: Bu özellik sadece yetkili kullanıcılar tarafından kullanılabilir. Hasta verilerinin güvenliği için tüm işlemler loglanır.
