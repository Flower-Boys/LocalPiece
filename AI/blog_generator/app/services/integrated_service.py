import os
import hashlib
from pathlib import Path
from typing import List
import requests

# 필요한 모든 서비스와 모델을 이 파일에서 한번에 관리합니다.
from app.models import AiGenerationRequestDto, BlogContent
from app.services.location_service import _fetch_place_name_from_kakao
from app.services import main_blip  # 팀원의 이미지 분석 로직

# ------------ 경로 설정 및 이미지 다운로더 ------------
BASE_DIR = Path(__file__).resolve().parent.parent
IMAGES_DIR = BASE_DIR / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

def _download_image(url: str) -> Path:
    """URL에서 이미지를 다운로드하고 로컬 파일 경로를 반환합니다."""
    try:
        h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:20]
        target = IMAGES_DIR / f"{h}.jpg"
        if not target.exists():
            with requests.get(url, stream=True, timeout=25) as r:
                r.raise_for_status()
                with open(target, "wb") as f:
                    for chunk in r.iter_content(8192):
                        f.write(chunk)
        return target
    except requests.exceptions.RequestException as e:
        print(f"ERROR: 이미지 다운로드 실패 - {url}: {e}")
        return None

def _create_sentence_from_analysis(place_name: str, city: str, analysis: dict) -> str:
    """
    [새로운 기능] 분석된 키워드와 장소명을 조합하여 자연스러운 문장을 생성합니다.
    팀원의 blog_generator.py를 대체하는 핵심 로직입니다.
    """
    # 1순위: 카카오 API로 찾은 장소명 사용
    if place_name:
        subject = place_name
        # 장소명과 함께 언급할 추가 키워드를 찾습니다.
        other_keywords = analysis.get('yolo', []) + analysis.get('places_ko', [])
        if other_keywords:
            detail = f"{other_keywords[0]}도 볼 수 있었어."
        else:
            detail = "멋진 풍경을 사진으로 남겼어."
        return f"오늘은 {subject}에 다녀왔어. 그곳에서 {detail}"

    # 2순위: 장소명이 없을 경우, 이미지 분석 결과를 활용
    yolo_keywords = analysis.get('yolo', [])
    place_keywords = analysis.get('places_ko', [])

    if yolo_keywords:
        subject = yolo_keywords[0]
        return f"{city} 여행 중 {subject}을(를) 발견했어. 정말 인상적인 순간이었지."
    elif place_keywords:
        subject = place_keywords[0]
        return f"이번 여행에서는 {subject} 같은 분위기의 장소를 방문했어. 잠시 쉬어가기 좋은 곳이었지."
    
    # 키워드가 아무것도 없으면 기본 문장 반환
    return f"{city}에서의 즐거운 순간을 사진으로 남겼어."


def create_blog_from_integrated_logic(req: AiGenerationRequestDto) -> (List[BlogContent], str):
    """
    [최종 통합 버전] 팀원의 빠른 로직과 위치 정보 로직을 완벽하게 결합한 파이프라인
    """
    blog_contents = []
    local_paths_to_clean = []
    
    photo_analysis_list_for_summary = [] # 요약용 분석 결과 저장

    for image_meta in req.images:
        # 1. 이미지 다운로드
        local_path = _download_image(image_meta.url)
        if not local_path:
            continue
        local_paths_to_clean.append(local_path)

        # 2. 이미지 분석 (팀원의 main_blip.py 로직)
        analysis_result = main_blip.analyze_image(local_path)
        photo_analysis_list_for_summary.append(analysis_result)
        
        # 3. 위치 정보 처리 (카카오 API)
        place_name = None
        if image_meta.latitude and image_meta.longitude:
            place_name = _fetch_place_name_from_kakao(image_meta.latitude, image_meta.longitude)
        
        # 4. 새로운 문장 생성 로직 호출
        blog_sentence = _create_sentence_from_analysis(place_name, req.city, analysis_result)
        
        blog_contents.append(
            BlogContent(image=image_meta.url, text=blog_sentence)
        )

    # 5. 요약 코멘트 생성 (팀원의 요약 로직은 그대로 활용)
    summary_comment = main_blip.make_summary_comment(photo_analysis_list_for_summary, city=req.city)

    # 6. 다운로드한 임시 이미지 파일 삭제
    for path in local_paths_to_clean:
        try:
            os.remove(path)
        except OSError as e:
            print(f"ERROR: 임시 파일 삭제 실패 - {path}: {e}")

    return blog_contents, summary_comment