# Timelapser API

Bu API, yüklenen görsel listesinden timelapse video oluşturur.

## Kurulum

1. Python 3.8 veya üzeri sürümün kurulu olduğundan emin olun
2. Gerekli paketleri yükleyin:
```bash
pip install -r requirements.txt
```

## Çalıştırma

```bash
python main.py
```

API varsayılan olarak http://localhost:8000 adresinde çalışacaktır.

## API Endpoint'leri

### POST /create-timelapse/

Görsel listesinden video oluşturur.

**İstek:**
- Method: POST
- Content-Type: multipart/form-data
- Body: images[] (multiple file upload)

**Yanıt:**
- Content-Type: video/mp4
- Body: Oluşturulan video dosyası

## Swagger Dokümantasyonu

API dokümantasyonuna http://localhost:8000/docs adresinden erişebilirsiniz. 