# app/config.py
import os
from pathlib import Path
from dotenv import load_dotenv

load_dotenv()

# --- 경로 설정 ---
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"
DATA_DIR = BASE_DIR / "data"
IMAGES_DIR = BASE_DIR / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True) # 이미지 저장 폴더 생성

# --- AI 블로그 생성기 설정 ---
MAX_PHOTOS_LIMIT = 15
CHAPTER_CLUSTER_DISTANCE_METERS = 150

# --- 카카오 API 설정 ---
KAKAO_API_KEY = os.getenv("KAKAO_API_KEY")
KAKAO_API_URL = "https://dapi.kakao.com/v2/local/geo/coord2address.json"