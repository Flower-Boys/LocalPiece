import re
from app.services.location_service import _fetch_place_name_from_kakao
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from typing import List
from app.models import AiGenerationRequestDto, AiResponseDto
from app.services.pipeline_service import create_ai_blog_v2
import os
import time
import hashlib
from pathlib import Path
import requests
from app.config import CHAPTER_CLUSTER_DISTANCE_METERS, KAKAO_API_KEY, KAKAO_API_URL
from app.services.integrated_service import create_blog_from_integrated_logic

from app.services.course_service import course_service
from app.models import CourseRequest, CourseResponse

os.environ['TZ'] = 'Asia/Seoul'
time.tzset()
# ------------ 경로 및 FastAPI 앱 설정 ------------
BASE_DIR = Path(__file__).resolve().parent
IMAGES_DIR = BASE_DIR / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

app = FastAPI(title="AI Blog Generator", version="5.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"],
)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "AI Story Blog Generator is running!"}


@app.post("/api/blogs/v2", response_model=AiResponseDto, summary="AI 블로그 생성")
def generate_upgraded_blog_endpoint(req: AiGenerationRequestDto):
    try:
        blog_contents, summary_comment = create_ai_blog_v2(req)
        return AiResponseDto(blog=blog_contents, comment=summary_comment)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/blogs", response_model=AiResponseDto, summary="AI 블로그 생성 (통합 최종 버전)")
def generate_blog(req: AiGenerationRequestDto):
    """
    팀원의 빠른 이미지 분석 로직과 카카오 API를 이용한 GPS 메타데이터 처리를
    하나로 통합한 최종 파이프라인을 실행합니다.
    """
    if not req.images:
        raise HTTPException(status_code=400, detail="이미지 목록이 비어있습니다.")

    try:
        # 새로 만든 통합 파이프라인 함수를 직접 호출합니다.
        blog_contents, summary_comment = create_blog_from_integrated_logic(req)
        
        return AiResponseDto(blog=blog_contents, comment=summary_comment)

    except Exception as e:
        # 파이프라인 실행 중 발생하는 모든 에러를 처리합니다.
        raise HTTPException(status_code=500, detail=f"AI 파이프라인 실행 중 오류 발생: {str(e)}")
    
@app.get("/api/kakao", summary="카카오맵 API 좌표 변환 테스트")
def test_kakao_api(lat: float, lon: float):
    """
    주어진 위도(lat)와 경도(lon)로 카카오 API를 테스트하여 장소명을 반환합니다.
    """
    place_name = _fetch_place_name_from_kakao(lat, lon)
    
    if place_name:
        return {"status": "success", "latitude": lat, "longitude": lon, "place_name": place_name}
    else:
        raise HTTPException(
            status_code=404,
            detail="카카오 API에서 해당 좌표의 장소 이름을 찾지 못했거나 API 키 인증에 실패했습니다."
        )
    
@app.get("/api/kakao-test", summary="카카오맵 API 좌표 변환 테스트")
def test_kakao_api(lat: float, lon: float):
    """
    주어진 위도(lat)와 경도(lon)로 카카오 API를 테스트하여 장소명을 반환합니다.
    """

    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {"x": lon, "y": lat}
    response = requests.get(KAKAO_API_URL, headers=headers, params=params, timeout=5)
    response.raise_for_status() 
    
    data = response.json().get("documents", [])

    return {"data": data}

@app.get("/api/kakao-test1", summary="카카오맵 API 좌표 변환 테스트")
def test_kakao_api(lat: float, lon: float, query: str = "카페", category_group_code: str = "CE7"):
    """
    주어진 위도(lat)와 경도(lon)로 카카오 API를 테스트하여 장소명을 반환합니다.
    """

    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    params = {"x": lon, "y": lat, "query": query, "category_group_code": category_group_code}
    response = requests.get("https://dapi.kakao.com/v2/local/search/keyword.json", headers=headers, params=params, timeout=5)
    response.raise_for_status() 
    
    data = response.json().get("documents", [])

    return {"data": data}

# --- 여행 코스 생성 라우트 추가 ---

@app.post("/api/courses/generate", response_model=CourseResponse, summary="여행 코스 생성")
async def generate_travel_course(request: CourseRequest):
    """
    사용자 요청에 따라 최적의 여행 코스를 생성하여 반환합니다.
    """
    try:
        # course_service를 호출하여 코스 생성 로직을 실행합니다.
        result = course_service.generate_course(request)
        return result
    except Exception as e:
        # 에러 발생 시 500 에러를 반환합니다.
        raise HTTPException(status_code=500, detail=str(e))


# @app.post("/api/prompt-test", response_model=PromptTestResponse, summary="KoGPT2 프롬프트 직접 테스트")
# def prompt_test_endpoint(req: PromptTestRequest):
#     """
#     사용자가 입력한 프롬프트를 KoGPT2 모델에 직접 전달하고,
#     모델이 생성한 원본 텍스트(raw text)를 그대로 반환합니다.
#     """
#     if not req.prompt:
#         raise HTTPException(status_code=400, detail="프롬프트를 입력해주세요.")
        
#     try:
#         # ai_model_service에 있는 한글 작가(KoGPT2)를 직접 호출합니다.
#         raw_response = ai_models.generate_korean_text_from_keywords(req.prompt)
        
#         # 사용자가 보낸 프롬프트와 AI의 응답을 함께 반환합니다.
#         return PromptTestResponse(prompt=req.prompt, response=raw_response)
#     except Exception as e:
#         raise HTTPException(status_code=500, detail=f"모델 생성 중 오류 발생: {str(e)}")


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
