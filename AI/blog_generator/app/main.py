from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from app.models import AiGenerationRequestDto, AiResponseDto
# from app.services.pipeline_service import create_ai_blog
from app.services.location_service import _fetch_place_name_from_kakao
from app.models import AiGenerationRequestDto, AiResponseDto, BlogContent
from app.services.pipeline_service import create_ai_blog_v2, create_ai_blog_original

app = FastAPI(title="AI Blog Generator (V1 vs V2)", version="2.2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Story Blog Generator is running!"}


# ✨ v2: 우리가 설계한 업그레이드 버전 API
@app.post("/api/blogs/v2", response_model=AiResponseDto, summary="업그레이드된 AI 블로그 생성")
def generate_upgraded_blog_endpoint(req: AiGenerationRequestDto):
    """
    시간/GPS 메타데이터와 팀원의 한글 로직을 결합한 v2 블로그를 생성합니다.
    """
    try:
        blog_contents, summary_comment = create_ai_blog_v2(req)
        return AiResponseDto(blog=blog_contents, comment=summary_comment)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


# ✨ v1: 비교를 위한 오리지널 버전 API
@app.post("/api/blogs/original", summary="오리지널 AI 블로그 생성 (비교용)")
def generate_original_blog_endpoint(req: AiGenerationRequestDto):
    """
    팀원분의 오리지널 로직을 그대로 사용하여 블로그를 생성합니다.
    """
    try:
        # 오리지널 로직은 다른 응답 형식을 가질 수 있으므로 그대로 반환
        result = create_ai_blog_original(req)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    
@app.get("/api/kakao-test")
def test_kakao_api(lat: float, lon: float):
    """
    주어진 위도(lat)와 경도(lon)로 카카오 API를 테스트하는 엔드포인트
    """
    print(f"카카오 API 테스트 요청: lat={lat}, lon={lon}")
    place_name = _fetch_place_name_from_kakao(lat, lon)
    
    if place_name:
        return {"status": "success", "latitude": lat, "longitude": lon, "place_name": place_name}
    else:
        raise HTTPException(
            status_code=404,
            detail="카카오 API에서 해당 좌표의 장소 이름을 찾지 못했거나, API 키 인증에 실패했습니다."
        )


# # main/main.py
# from app.services import main_blip  # 같은 폴더
# import os
# import hashlib
# from pathlib import Path
# from typing import List, Optional
# from fastapi.responses import JSONResponse
# from uuid import uuid4

# import requests
# from fastapi import FastAPI, HTTPException
# from fastapi.middleware.cors import CORSMiddleware
# from pydantic import BaseModel, Field

# # 경로
# BASE_DIR = Path(__file__).resolve().parent
# IMAGES_DIR = BASE_DIR / "images"
# IMAGES_DIR.mkdir(parents=True, exist_ok=True)

# # 파이프라인 모듈 import

# # ------------ FastAPI ------------
# app = FastAPI(title="Travel Blog Generator", version="1.0.0")
# app.add_middleware(
#     CORSMiddleware,
#     allow_origins=["*"],  # 필요 시 제한
#     allow_credentials=True,
#     allow_methods=["*"],
#     allow_headers=["*"],
# )


# class AnalyzeRequest(BaseModel):
#     image_urls: List[str] = Field(..., min_items=1,
#                                   description="오라클 이미지 URL 배열")
#     city: Optional[str] = Field("OO도시", description="도시명(옵션)")


# class AnalyzeResponse(BaseModel):
#     blog_text: str
#     photos: list  # 디버그용: yolo/places/caption 등


# def _guess_ext_from_ct(ct: str) -> str:
#     ct = (ct or "").lower()
#     if "jpeg" in ct or "jpg" in ct:
#         return ".jpg"
#     if "png" in ct:
#         return ".png"
#     if "webp" in ct:
#         return ".webp"
#     if "bmp" in ct:
#         return ".bmp"
#     return ".jpg"


# def download_image(url: str, timeout: int = 25) -> Path:
#     h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:20]
#     target = IMAGES_DIR / f"{h}.jpg"
#     if target.exists():
#         return target
#     try:
#         with requests.get(url, stream=True, timeout=timeout) as r:
#             if r.status_code != 200:
#                 raise HTTPException(
#                     status_code=400, detail=f"Failed to fetch: {url} ({r.status_code})")
#             ext = _guess_ext_from_ct(r.headers.get("Content-Type", ""))
#             target = IMAGES_DIR / f"{h}{ext}"
#             with open(target, "wb") as f:
#                 for chunk in r.iter_content(8192):
#                     if chunk:
#                         f.write(chunk)
#         return target
#     except requests.exceptions.RequestException as e:
#         raise HTTPException(
#             status_code=400, detail=f"Download error for {url}: {e}")


# @app.get("/api/health")
# def health():
#     return {"ok": True}


# @app.post("/api/blogs", response_model=AnalyzeResponse)
# def analyze(req: AnalyzeRequest):
#     # URL → 로컬 파일
#     paths: List[Path] = []
#     for u in req.image_urls:
#         p = download_image(u)
#         paths.append(p)

#     if not paths:
#         raise HTTPException(status_code=400, detail="다운로드된 이미지가 없습니다.")

#     # 파이프라인 실행
#     result = main_blip.make_blog_from_paths(paths, city=(req.city or "OO도시"))
#     blog_text = " ".join([item['text'] for item in result['blog']])
#     photos = [item['image'] for item in result['blog']]

#     return AnalyzeResponse(blog_text=blog_text, photos=photos)
#     # return AnalyzeResponse(**result)
