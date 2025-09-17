from app.models import AiGenerationRequestDto, AnalyzedPhoto
from . import preprocessor_service, location_service, analysis_service, story_service_v2
import os
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
from pathlib import Path
from typing import List, Optional
import requests
from app.models import AiGenerationRequestDto, AiResponseDto, BlogContent, ImageMetadataDto, AnalyzedPhoto
from . import preprocessor_service, location_service, analysis_service, story_service_v2

# 필요한 서비스와 모델을 모두 import합니다.
from app.models import AiGenerationRequestDto, BlogContent
from app.services.location_service import _fetch_place_name_from_kakao
from app.services import main_blip 
from app.services import blog_generator 

def _process_single_photo_v2(photo_meta: ImageMetadataDto, city: str) -> Optional[BlogContent]:
    """
    [병렬 작업용 함수] V2 파이프라인의 사진 한 장에 대한 전체 처리 과정을 수행합니다.
    """
    try:
        # 1. 위치 정보 분석
        place_name = None
        if photo_meta.latitude and photo_meta.longitude:
            place_name = location_service._fetch_place_name_from_kakao(photo_meta.latitude, photo_meta.longitude)
        
        photo_to_analyze = AnalyzedPhoto(metadata=photo_meta, place_name=place_name)

        # 2. 시각 정보 분석 (analysis_service가 내부적으로 임시 파일을 생성하고 삭제합니다)
        analyzed_photo = analysis_service.analyze_photos([photo_to_analyze])[0]
        if analyzed_photo.analysis.get("error"):
            print(f"이미지 분석 실패: {photo_meta.url}")
            return None

        # 3. 블로그 문장 생성 (story_service_v2)
        prompt = story_service_v2._create_exaone_prompt(city, analyzed_photo.analysis, analyzed_photo.place_name)
        blog_sentence = story_service_v2.ai_models.generate_korean_text_from_keywords(prompt)
        blog_sentence = blog_sentence.strip().strip('"') # 간단한 후처리

        # 4. 최종 결과 조합
        final_text = ""
        if place_name:
            final_text += f"📍 {place_name}\n\n"
        final_text += blog_sentence

        return BlogContent(image=photo_meta.url, text=final_text)

    except Exception as e:
        print(f"ERROR: 병렬 처리 중 사진({photo_meta.url}) 처리 실패: {e}")
        return None

def create_ai_blog_v2(req: AiGenerationRequestDto) -> (List[BlogContent], str):
    """
    [V2 최종 버전] 원래의 순차 파이프라인을 병렬 처리 방식으로 변경하여 속도를 개선합니다.
    """
    # 1단계: 데이터 준비 (시간순 정렬) - 원래 로직과 동일
    timed_photos_meta, untimed_photos_meta = preprocessor_service.prepare_data(req.images)
    all_photos_in_order = timed_photos_meta + untimed_photos_meta
    
    # 2단계 ~ 4단계를 병렬로 처리
    blog_contents_dict = {}
    
    # 허깅페이스 2코어 환경에 맞춰 max_workers=2로 설정하여 CPU 과부하를 방지합니다.
    with ThreadPoolExecutor(max_workers=2) as executor:
        # 정렬된 사진 목록을 병렬 처리 작업으로 제출합니다.
        future_to_url = {executor.submit(_process_single_photo_v2, meta, req.city): meta.url for meta in all_photos_in_order}
        
        # 작업이 끝나는 순서대로 결과를 딕셔너리에 저장합니다.
        for future in as_completed(future_to_url):
            url = future_to_url[future]
            result = future.result()
            if result:
                blog_contents_dict[url] = result
    
    # 3단계: 최종 결과물을 원래의 시간 순서대로 재정렬합니다.
    final_blog_contents = []
    for meta in all_photos_in_order:
        if meta.url in blog_contents_dict:
            final_blog_contents.append(blog_contents_dict[meta.url])

    if not final_blog_contents:
        return [], "분석 가능한 이미지가 없거나 처리 중 오류가 발생했습니다."

    # 4단계: 요약 코멘트 생성 (시간상 가장 첫 번째 블로그 내용 기반)
    summary_comment = "AI가 생성한 여행의 순간들"
    if final_blog_contents:
        summary_comment = final_blog_contents[0].text.split('\n\n')[-1].split('.')[0] + '.'

    return final_blog_contents, summary_comment

# ------------ 경로 설정 및 이미지 다운로더 ------------
BASE_DIR = Path(__file__).resolve().parent.parent
IMAGES_DIR = BASE_DIR / "images"
IMAGES_DIR.mkdir(parents=True, exist_ok=True)

def _download_image(url: str) -> Path:
    h = hashlib.sha1(url.encode("utf-8")).hexdigest()[:20]
    target = IMAGES_DIR / f"{h}.jpg"
    if target.exists():
        return target
    with requests.get(url, stream=True, timeout=25) as r:
        r.raise_for_status()
        with open(target, "wb") as f:
            for chunk in r.iter_content(8192):
                f.write(chunk)
    return target

# ------------ 새로운 파이프라인 함수 ------------

def create_fast_blog_with_metadata(req: AiGenerationRequestDto) -> (List[BlogContent], str):
    """
    [최종 버전] LLM(느린 AI)을 제외하고, 팀원의 빠른 로직에 카카오 API만 추가한 파이프라인
    """
    photo_analysis_list = []
    local_paths_to_clean = []

    for image_meta in req.images:
        # 1. 이미지 다운로드
        local_path = _download_image(image_meta.url)
        local_paths_to_clean.append(local_path)

        # 2. 이미지 분석 (팀원의 main_blip.py 로직)
        # YOLO, Places365, BLIP 캡션을 통해 키워드를 추출합니다.
        analysis_result = main_blip.analyze_image(local_path)
        
        # 3. 메타데이터 처리 (카카오 API)
        # GPS 정보가 있으면 장소명을 찾아 키워드 목록의 맨 앞에 추가합니다.
        if image_meta.latitude and image_meta.longitude:
            place_name = _fetch_place_name_from_kakao(image_meta.latitude, image_meta.longitude)
            if place_name:
                # 장소명을 키워드 리스트의 가장 중요한 첫 번째 요소로 삽입
                analysis_result['yolo'].insert(0, place_name)
        
        photo_analysis_list.append(analysis_result)

    # 4. 블로그 문장 생성 (팀원의 blog_generator.py 로직)
    # LLM 대신, 키워드를 조합하는 템플릿 기반의 빠른 생성기를 사용합니다.
    blog_texts = blog_generator.make_blog_batch(photo_analysis_list, city=req.city, return_list=True)

    # 5. 최종 결과 조합
    blog_contents = []
    for i, text in enumerate(blog_texts):
        blog_contents.append(
            BlogContent(image=req.images[i].url, text=text)
        )
    
    # 6. 요약 코멘트 생성 (팀원의 요약 로직 활용)
    summary_comment = main_blip.make_summary_comment(photo_analysis_list, city=req.city)

    # 7. 다운로드한 임시 이미지 파일 삭제
    for path in local_paths_to_clean:
        try:
            os.remove(path)
        except OSError as e:
            print(f"ERROR: 임시 파일 삭제 실패 - {path}: {e}")

    return blog_contents, summary_comment