from fastapi import FastAPI, UploadFile, File, Request, HTTPException
from fastapi.responses import FileResponse, JSONResponse, StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from fastapi.exceptions import RequestValidationError
from starlette.exceptions import HTTPException as StarletteHTTPException
import cv2
import numpy as np
from PIL import Image
import io
import os
from typing import List
import tempfile
import shutil
import logging
import time
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor
from functools import partial

# Loglama konfigürasyonu
LOG_FORMAT = '%(asctime)s - %(levelname)s - %(message)s'
logging.basicConfig(
    level=logging.INFO,
    format=LOG_FORMAT,
    handlers=[
        logging.FileHandler('api.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="Timelapser API",
    description="Görsel listesinden video oluşturan API",
    version="1.0.0"
)

# CORS ayarları
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["Content-Disposition"]
)

# Validasyon hatalarını yakala
@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    error_detail = exc.errors()
    error_messages = []
    
    for error in error_detail:
        field = " -> ".join(str(x) for x in error["loc"])
        message = error["msg"]
        error_messages.append(f"Alan: {field}, Hata: {message}")
    
    error_log = "\n".join(error_messages)
    logger.error(f"Validasyon hatası:\n{error_log}")
    
    return JSONResponse(
        status_code=422,
        content={
            "detail": "İstek formatı geçersiz",
            "errors": [
                {
                    "field": " -> ".join(str(x) for x in error["loc"]),
                    "message": error["msg"]
                }
                for error in error_detail
            ]
        }
    )

# HTTP hatalarını yakala
@app.exception_handler(StarletteHTTPException)
async def http_exception_handler(request: Request, exc: StarletteHTTPException):
    logger.error(f"HTTP Hatası: {exc.status_code} - {exc.detail}")
    return JSONResponse(
        status_code=exc.status_code,
        content={"detail": exc.detail}
    )

# Request/Response middleware
@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    request_body = None
    
    # Request bilgilerini logla
    logger.info(f"Request başladı - Method: {request.method} - URL: {request.url}")
    
    try:
        if request.method in ["POST", "PUT"]:
            try:
                request_body = await request.form()
                logger.info(f"Request içeriği: {dict(request_body)}")
            except:
                pass
                
        response = await call_next(request)
        
        # Response bilgilerini logla
        process_time = time.time() - start_time
        logger.info(
            f"Request tamamlandı - Method: {request.method} - "
            f"URL: {request.url} - Status: {response.status_code} - "
            f"İşlem süresi: {process_time:.2f}s"
        )
        return response
        
    except Exception as e:
        # Hata durumunda logla
        logger.error(
            f"Hata oluştu - Method: {request.method} - URL: {request.url} - "
            f"Hata: {str(e)}"
        )
        raise

def process_image(img_data, base_size, temp_dir, index):
    try:
        # Görsel boyutunu küçült
        image = Image.open(io.BytesIO(img_data))
        
        # En büyük boyut 1920 olacak şekilde yeniden boyutlandır
        max_size = 1920
        if base_size:
            target_width, target_height = base_size
        else:
            ratio = min(max_size / image.size[0], max_size / image.size[1])
            target_width = int(image.size[0] * ratio)
            target_height = int(image.size[1] * ratio)
        
        image = image.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # JPEG kalitesini düşür (boyut/kalite optimizasyonu)
        temp_path = os.path.join(temp_dir, f"image_{index:04d}.jpg")
        image.save(temp_path, "JPEG", quality=85, optimize=True)
        return temp_path
    except Exception as e:
        logger.error(f"Görsel işleme hatası: {str(e)}")
        return None

@app.post("/create-timelapse/")
async def create_timelapse(images: List[UploadFile] = File(..., description="İşlenecek görsel listesi")):
    if not images:
        error_msg = "Görsel listesi boş olamaz"
        logger.error(error_msg)
        raise HTTPException(status_code=400, detail=error_msg)
        
    logger.info(f"Timelapse oluşturma isteği alındı - Görsel sayısı: {len(images)}")
    
    try:
        with tempfile.TemporaryDirectory() as temp_dir:
            # Görselleri oku ve boyutlarını kontrol et
            image_contents = []
            base_size = None
            
            for img in images:
                if not img.content_type.startswith('image/'):
                    raise HTTPException(
                        status_code=400,
                        detail=f"Geçersiz dosya türü: {img.filename} - {img.content_type}"
                    )
                content = await img.read()
                image_contents.append(content)
                
                # İlk görselden baz boyutu al
                if base_size is None:
                    with Image.open(io.BytesIO(content)) as img:
                        # En büyük boyut 1920 olacak şekilde oran hesapla
                        max_size = 1920
                        ratio = min(max_size / img.size[0], max_size / img.size[1])
                        base_size = (
                            int(img.size[0] * ratio),
                            int(img.size[1] * ratio)
                        )

            # Paralel görsel işleme
            with ThreadPoolExecutor() as executor:
                process_func = partial(process_image, base_size=base_size, temp_dir=temp_dir)
                image_paths = list(executor.map(process_func, image_contents, range(len(images))))

            # Hatalı işlemeleri filtrele
            image_paths = [p for p in image_paths if p is not None]
            
            if not image_paths:
                raise HTTPException(status_code=400, detail="İşlenebilir görsel bulunamadı")

            # Video oluştur
            output_path = os.path.join(temp_dir, "timelapse.mp4")
            frame = cv2.imread(image_paths[0])
            height, width, _ = frame.shape
            
            # H264 codec kullan (daha hızlı ve daha iyi sıkıştırma)
            fourcc = cv2.VideoWriter_fourcc(*'avc1')
            out = cv2.VideoWriter(
                output_path,
                fourcc,
                24.0,
                (width, height),
                True
            )

            if not out.isOpened():
                raise HTTPException(status_code=500, detail="Video yazıcı başlatılamadı")

            # Frameleri yaz
            for img_path in image_paths:
                frame = cv2.imread(img_path)
                if frame is not None:
                    out.write(frame)

            out.release()

            if not os.path.exists(output_path):
                raise HTTPException(status_code=500, detail="Video dosyası oluşturulamadı")

            # Video dosyasını stream olarak dön
            with open(output_path, "rb") as video_file:
                video_data = video_file.read()

            return StreamingResponse(
                io.BytesIO(video_data),
                media_type="video/mp4",
                headers={
                    "Content-Disposition": f'attachment; filename="timelapse.mp4"',
                    "Access-Control-Expose-Headers": "Content-Disposition"
                }
            )
            
    except HTTPException:
        raise
    except Exception as e:
        error_msg = f"Beklenmeyen hata: {str(e)}"
        logger.error(error_msg)
        raise HTTPException(status_code=500, detail=error_msg)

if __name__ == "__main__":
    logger.info("API başlatılıyor...")
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 