# main/main.py
from app.services import main_blip  # 같은 폴더
import os
import hashlib
from pathlib import Path
from typing import List, Optional

import requests
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

# 경로
BASE_DIR = Path(__file__).resolve().parent
IMAGES_DIR = BASE_DIR / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# 파이프라인 모듈 import

# ------------ FastAPI ------------
app = FastAPI(title="Travel Blog Generator", version="1.0.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 필요 시 제한
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class AnalyzeRequest(BaseModel):
    image_urls: List[str] = Field(..., min_items=1,
                                  description="오라클 이미지 URL 배열")
    city: Optional[str] = Field("OO도시", description="도시명(옵션)")


class AnalyzeResponse(BaseModel):
    blog_text: str
    photos: list  # 디버그용: yolo/places/caption 등


def _guess_ext_from_ct(ct: str) -> str:
    ct = (ct or "").lower()
    if "jpeg" in ct or "jpg" in ct:
        return ".jpg"
    if "png" in ct:
        return ".png"
    if "webp" in ct:
        return ".webp"
    if "bmp" in ct:
        return ".bmp"
    return ".jpg"


def download_image(url: str, timeout: int = 25) -> Path:
    h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:20]
    target = IMAGES_DIR / f"{h}.jpg"
    if target.exists():
        return target
    try:
        with requests.get(url, stream=True, timeout=timeout) as r:
            if r.status_code != 200:
                raise HTTPException(
                    status_code=400, detail=f"Failed to fetch: {url} ({r.status_code})")
            ext = _guess_ext_from_ct(r.headers.get("Content-Type", ""))
            target = IMAGES_DIR / f"{h}{ext}"
            with open(target, "wb") as f:
                for chunk in r.iter_content(8192):
                    if chunk:
                        f.write(chunk)
        return target
    except requests.exceptions.RequestException as e:
        raise HTTPException(
            status_code=400, detail=f"Download error for {url}: {e}")


@app.get("/health")
def health():
    return {"ok": True}


@app.post("/analyze", response_model=AnalyzeResponse)
def analyze(req: AnalyzeRequest):
    # URL → 로컬 파일
    paths: List[Path] = []
    for u in req.image_urls:
        p = download_image(u)
        paths.append(p)

    if not paths:
        raise HTTPException(status_code=400, detail="다운로드된 이미지가 없습니다.")

    # 파이프라인 실행
    result = main_blip.make_blog_from_paths(paths, city=(req.city or "OO도시"))
    return AnalyzeResponse(**result)
