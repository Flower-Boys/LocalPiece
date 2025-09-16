from app.models import AiGenerationRequestDto
from . import preprocessor_service, location_service, analysis_service, original_story_service, story_service_v2

def create_ai_blog_v2(req: AiGenerationRequestDto):
    """v2: 업그레이드 버전 파이프라인"""
    timed_photos, untimed_photos = preprocessor_service.prepare_data(req.images)
    
    chapters = location_service.cluster_photos_into_chapters(timed_photos)

    for chapter in chapters:
        chapter.photos = analysis_service.analyze_photos([p.metadata for p in chapter.photos])
    
    analyzed_untimed_photos = analysis_service.analyze_photos(untimed_photos)

    return story_service_v2.write_upgraded_story(
        city=req.city,
        chapters=chapters,
        untimed_photos=analyzed_untimed_photos
    )

def create_ai_blog_original(req: AiGenerationRequestDto):
    """v1: 오리지널 버전 파이프라인"""
    # 오리지널 로직은 시간/GPS를 사용하지 않으므로, 모든 사진을 분석
    analyzed_photos = analysis_service.analyze_photos(req.images)
    
    return original_story_service.create_original_blog(req.city, analyzed_photos)