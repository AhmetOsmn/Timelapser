# Timelapser

Fotoğraflarınızdan kolayca video oluşturmanızı sağlayan mobil uygulama.

## Özellikler

- 📱 Kullanıcı Kimlik Doğrulama
  - E-posta ve şifre ile kayıt
  - Güvenli giriş sistemi
  - Oturum yönetimi

- 🎬 Video Oluşturma
  - Çoklu fotoğraf seçimi
  - 5-15 saniye arası video süresi ayarlama
  - Otomatik fotoğraf geçiş efektleri
  - Video oluşturma sürecinde ilerleme göstergesi

- 📁 Video Yönetimi
  - Oluşturulan videoları görüntüleme
  - Video önizleme ve oynatma
  - Videoları cihaza indirme
  - Video silme özelliği
  - Maksimum 10 video depolama limiti

## Kurulum

1. Gereksinimler:
   - Node.js (v14 veya üzeri)
   - npm veya yarn
   - Expo CLI
   - iOS için Xcode (macOS)
   - Android için Android Studio

2. Projeyi klonlayın:
   ```bash
   git clone https://github.com/kullanici/timelapser.git
   cd timelapser
   ```

3. Bağımlılıkları yükleyin:
   ```bash
   npm install
   # veya
   yarn install
   ```

4. Uygulamayı başlatın:
   ```bash
   npm start
   # veya
   yarn start
   ```

## Geliştirme Durumu

- [x] Temel uygulama yapısı
- [x] Navigasyon sistemi
- [x] Kimlik doğrulama ekranı
- [x] Ana sayfa tasarımı
- [x] Video oluşturma arayüzü
- [x] Video listesi ve yönetimi
- [ ] Video oluşturma mantığı
- [ ] Kimlik doğrulama entegrasyonu
- [ ] Video depolama sistemi
- [ ] Video indirme özelliği
- [ ] Performans optimizasyonları

## Teknolojiler

- React Native
- Expo
- TypeScript
- React Navigation
- Expo AV
- Expo Image Picker
- Expo File System
- React Native Safe Area Context

## Lisans

Bu proje MIT lisansı altında lisanslanmıştır. Detaylar için [LICENSE](LICENSE) dosyasına bakın. 