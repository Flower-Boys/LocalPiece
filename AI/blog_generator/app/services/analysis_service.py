# app/services/analysis_service.py
from typing import List
import requests
import hashlib
from pathlib import Path
from PIL import Image
from app.models import ImageMetadataDto, AnalyzedPhoto
from app.config import IMAGES_DIR
from app.services.ai_model_service import ai_models # 통합된 AI 모델 서비스 임포트

def _download_image(url: str) -> Path | None:
    """URL에서 이미지를 다운로드하고 로컬 경로를 반환합니다."""
    try:
        h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:20]
        # 확장자를 알 수 없으므로, 임시 파일명을 사용하고 Pillow로 열어서 저장
        temp_path = IMAGES_DIR / f"{h}"
        
        res = requests.get(url, stream=True, timeout=25)
        res.raise_for_status()
        
        with open(temp_path, "wb") as f:
            for chunk in res.iter_content(8192):
                f.write(chunk)
        
        # 이미지 파일로 제대로 저장
        img = Image.open(temp_path)
        final_path = IMAGES_DIR / f"{h}.{img.format.lower()}"
        img.save(final_path)
        temp_path.unlink() # 임시 파일 삭제
        return final_path
        
    except Exception as e:
        print(f"WARNING: 이미지 다운로드 실패 {url}: {e}")
        return None

def analyze_photos(photos: List[ImageMetadataDto]) -> List[AnalyzedPhoto]:
    """사진 DTO 리스트를 받아 분석하고 AnalyzedPhoto 리스트를 반환합니다."""
    analyzed_results = []
    for photo_meta in photos:
        image_path = _download_image(photo_meta.url)
        
        try: # ✨ try...finally 구문 추가
            if image_path:
                prediction = ai_models.predict(image_path)
                analyzed_photo = AnalyzedPhoto(
                    metadata=photo_meta,
                    yolo_objects=prediction["yolo_objects"],
                    place_type=prediction["place_type"],
                    caption=prediction["caption"]
                )
            else:
                analyzed_photo = AnalyzedPhoto(metadata=photo_meta)
                
            analyzed_results.append(analyzed_photo)
        finally:
            # ✨ 분석이 끝나면 성공/실패 여부와 관계없이 파일 삭제
            if image_path and image_path.exists():
                image_path.unlink()
                
    return analyzed_results