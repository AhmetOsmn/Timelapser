# Timelapser

Timelapser, fotoğraflardan time-lapse video oluşturmanıza olanak sağlayan çok platformlu bir uygulamadır. Bu proje üç ana bileşenden oluşmaktadır: API, Web ve Mobil uygulama.

## Teknoloji Yığını

### Backend (API)
- **Framework:** FastAPI
- **Python Sürümü:** 3.x
- **Ana Kütüphaneler:**
  - FastAPI: REST API framework'ü
  - uvicorn: ASGI sunucusu
  - OpenCV: Görüntü işleme
  - Pillow: Resim manipülasyonu
  - python-dotenv: Ortam değişkenleri yönetimi

### Mobil Uygulama
- **Framework:** React Native (Expo)
- **Dil:** TypeScript
- **Ana Kütüphaneler:**
  - Expo: Cross-platform geliştirme platformu
  - React Navigation: Sayfa yönetimi
  - i18next: Çoklu dil desteği
  - Zustand: State yönetimi
  - Expo Image Picker: Medya seçimi

### Web Uygulaması
- **Framework:** React
- **Dil:** TypeScript
- **Stil:** Tailwind CSS
- **State Yönetimi:** Zustand

## Kurulum

### API
```bash
cd api
pip install -r requirements.txt
uvicorn main:app --reload
```

### Mobil Uygulama
```bash
cd mobile
npm install
npx expo start
```

### Web Uygulaması
```bash
cd timelapser-web
npm install
npm run dev
```

## Özellikler
- Fotoğraflardan time-lapse video oluşturma
- Çoklu platform desteği (Web, Mobil)
- Çoklu dil desteği (Türkçe, İngilizce)
- Modern ve kullanıcı dostu arayüz


