from typing import List, Dict

# 팀원분의 오리지널 로직을 그대로 임포트합니다.
from app.services import blog_generator as OriginalGenerator
from app.models import AnalyzedPhoto

def create_original_blog(city: str, analyzed_photos: List[AnalyzedPhoto]) -> Dict:
    """
    오리지널 로직(blog_generator.py)을 사용하여 블로그를 생성합니다.
    """
    # 오리지널 로직이 요구하는 데이터 형식(dict 리스트)으로 변환
    photo_infos_for_original = []
    for photo in analyzed_photos:
        photo_infos_for_original.append({
            "yolo": photo.yolo_objects,
            "places": [photo.place_type], # places는 리스트 형태여야 함
            "caption": photo.caption,
            "url": photo.metadata.url # 응답에 URL을 포함시키기 위해 추가
        })

    # 오리지널 로직의 make_blog_batch 함수를 직접 호출
    blog_text = OriginalGenerator.make_blog_batch(photo_infos_for_original, city=city)
    
    # 오리지널 로직의 응답 형식에 맞춰 반환
    return {"blog_text": blog_text, "photos": photo_infos_for_original}