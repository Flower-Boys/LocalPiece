from app.models import AiGenerationRequestDto, AnalyzedPhoto
from . import preprocessor_service, location_service, analysis_service, story_service_v2

def create_ai_blog_v2(req: AiGenerationRequestDto):
    """
    ✨ (최종 수정) 새로운 데이터 모델에 완벽하게 맞춘 파이프라인
    """
    # 1단계: 데이터 준비
    timed_photos_meta, untimed_photos_meta = preprocessor_service.prepare_data(req.images)

    # 2단계: 위치 정보 분석 (카카오맵 API)
    timed_photos = []
    for photo_meta in timed_photos_meta:
        place_name = None
        if photo_meta.latitude and photo_meta.longitude:
            place_name = location_service._fetch_place_name_from_kakao(photo_meta.latitude, photo_meta.longitude)
        
        timed_photos.append(AnalyzedPhoto(metadata=photo_meta, place_name=place_name))

    untimed_photos = [AnalyzedPhoto(metadata=p) for p in untimed_photos_meta]
    
    # 3단계: 시각 정보 분석 (AI 키워드 추출)
    analyzed_timed_photos = analysis_service.analyze_photos(timed_photos)
    analyzed_untimed_photos = analysis_service.analyze_photos(untimed_photos)

    # 4단계: 블로그 글 생성 (이제 장소명이 없어도 키워드로 글을 생성합니다)
    return story_service_v2.write_story(
        city=req.city,
        timed_photos=analyzed_timed_photos,
        untimed_photos=analyzed_untimed_photos
    )