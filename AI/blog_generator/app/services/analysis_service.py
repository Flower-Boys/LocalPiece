import os
from typing import List
from app.models import AnalyzedPhoto
from app.services.ai_model_service import ai_models
from pathlib import Path
import requests
import hashlib

# AI 분석을 위해 이미지를 임시 저장할 폴더
TEMP_IMAGES_DIR = Path("temp_images")
TEMP_IMAGES_DIR.mkdir(parents=True, exist_ok=True)

def _download_image_from_url(url: str) -> Path | None:
    """URL에서 이미지를 다운로드하여 로컬 파일 경로를 반환합니다."""
    try:
        file_name = hashlib.sha256(url.encode()).hexdigest() + ".jpg"
        image_path = TEMP_IMAGES_DIR / file_name
        
        if image_path.exists():
            return image_path
            
        response = requests.get(url, stream=True, timeout=10)
        response.raise_for_status()
        
        with open(image_path, 'wb') as f:
            for chunk in response.iter_content(chunk_size=8192):
                f.write(chunk)
        return image_path
    except requests.exceptions.RequestException as e:
        print(f"ERROR: 이미지 다운로드 실패 - {url}: {e}")
        return None

def analyze_photos(photos: List[AnalyzedPhoto]) -> List[AnalyzedPhoto]:
    """
    AnalyzedPhoto 객체 리스트를 받아 각 이미지의 AI 분석을 수행하고,
    결과를 객체의 'analysis' 필드에 채워넣습니다.
    """
    for photo in photos:
        image_url = photo.metadata.url
        local_path = _download_image_from_url(image_url)
        
        if local_path:
            analysis_result = ai_models.analyze_image_to_keywords(local_path)
            photo.analysis = analysis_result
            
            # 👈 [추가] 이미지 분석이 끝난 후, 다운로드했던 임시 파일을 삭제합니다.
            try:
                os.remove(local_path)
            except OSError as e:
                print(f"ERROR: 임시 파일 삭제 실패 - {local_path}: {e}")
        else:
            photo.analysis = {"error": "Image download failed"}
            
    return photos