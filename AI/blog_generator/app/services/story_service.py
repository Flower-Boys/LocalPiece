# app/services/story_service.py
import random
from datetime import datetime, timedelta
from typing import List, Tuple
from app.models import BlogContent, Chapter, AnalyzedPhoto
from app.utils.korean_text_util import translate_place, create_sentence_for_photo, josa 


# --- 텍스트 생성을 위한 헬퍼 딕셔너리 및 함수 ---

# Places365의 영어 라벨을 자연스러운 한국어 장소로 변환
PLACE_MAP = {
    "temple": "사찰", "church": "교회", "park": "공원", "beach": "해변",
    "cafe": "카페", "restaurant": "레스토랑", "bar": "바",
    "museum": "박물관", "gallery": "미술관", "library": "도서관",
    "tower": "전망대", "bridge": "다리", "street": "거리", "market": "시장"
}

def _translate_place(place: str) -> str:
    """Places365 라벨을 한국어로 변환, 없으면 그대로 반환"""
    # 'temple/asia' 같은 경우 'temple'만 사용
    main_place = place.split('/')[0]
    return PLACE_MAP.get(main_place, main_place)

def _get_time_greeting(hour: int) -> str:
    """시간대에 맞는 인사말 생성"""
    if 5 <= hour < 12: return "아침 햇살과 함께"
    if 12 <= hour < 17: return "나른하고 여유로운 오후"
    if 17 <= hour < 21: return "아름다운 노을이 물드는 저녁"
    return "고요한 밤의 정취 속에서"

# --- 메인 스토리 생성 함수 ---

def _create_opening(city: str, first_chapter: Chapter) -> str:
    """블로그 오프닝 문단 생성"""
    place_name = first_chapter.place_name
    if place_name == "기억에 남는 장소":
        # 카카오 API 실패 시, AI가 분석한 장소 유형을 한국어로 변환하여 사용
        place_name = _translate_place(first_chapter.photos[0].place_type)

    greeting = "어느 멋진 날,"
    if first_chapter.start_time:
        try:
            hour = datetime.fromisoformat(first_chapter.start_time).hour
            greeting = _get_time_greeting(hour)
        except ValueError: pass
    
    return f"설렘 가득한 {city} 여행의 시작! ✈️ {greeting}, 저희의 첫 번째 이야기, '{place_name}'에서 문을 엽니다."

def _create_chapter_body(chapter: Chapter) -> List[str]:
    """챕터의 각 사진에 대한 감성적인 한국어 묘사 문장 생성"""
    descriptions = []
    for photo in chapter.photos:
        # ✨ 이제 새로운 문장 생성 엔진을 사용합니다!
        sentence = create_sentence_for_photo(photo)
        descriptions.append(sentence)
    return descriptions

def _create_transition(from_chapter: Chapter, to_chapter: Chapter) -> str:
    """두 챕터 사이를 잇는 전환 문장 생성"""
    from_place_name = from_chapter.place_name
    if from_place_name == "기억에 남는 장소":
        from_place_name = translate_place(from_chapter.photos[-1].place_type)
        
    to_place_name = to_chapter.place_name
    if to_place_name == "기억에 남는 장소":
        to_place_name = translate_place(to_chapter.photos[0].place_type)

    return f"\n'{from_place_name}'에서의 즐거운 시간을 뒤로 하고, 저희는 다음 목적지인 '{to_place_name}'{josa(to_place_name, ('으로','로'))} 발걸음을 옮겼습니다. 🚗"


def _create_untimed_section(photos: List[AnalyzedPhoto]) -> List[BlogContent]:
    """시간 정보 없는 사진들을 위한 특별 섹션 생성"""
    # (이전 버전과 동일)
    if not photos:
        return []
    
    contents = []
    header = "\n✨ 이번 여행의 잊지 못할 순간들 ✨"
    first_text = f"{header}\n{photos[0].caption} 이 사진을 보니 그 때의 감정이 다시 떠오르네요."
    contents.append(BlogContent(image=photos[0].metadata.url, text=first_text))

    for photo in photos[1:]:
        text = f"{photo.caption} 이번 여행의 또 다른 소중한 기록이에요."
        contents.append(BlogContent(image=photo.metadata.url, text=text))
    return contents

def _create_closing(city: str, last_chapter: Chapter) -> str:
    """블로그 마무리 문단 생성"""
    place_name = last_chapter.place_name
    if place_name == "기억에 남는 장소":
        place_name = _translate_place(last_chapter.photos[-1].place_type)
        
    return f"\n'{place_name}'에서의 기억을 마지막으로, {city}에서의 행복했던 하루가 저물어갑니다. 모든 순간이 소중한 추억으로 남을 거예요. 👋"

def write_story(city: str, chapters: List[Chapter], untimed_photos: List[AnalyzedPhoto]) -> Tuple[List[BlogContent], str]:
    """모든 정보를 종합하여 블로그 콘텐츠 리스트와 요약 코멘트를 작성"""
    # (이전 버전과 동일)
    if not chapters:
        blog_contents = _create_untimed_section(untimed_photos)
        summary = "이번 여행의 소중한 순간들을 모아봤어요." if blog_contents else "생성할 이야기가 없네요."
        return blog_contents, summary

    blog_contents = []
    
    opening_text = _create_opening(city, chapters[0])
    blog_contents.append(BlogContent(image=chapters[0].photos[0].metadata.url, text=opening_text))
    
    for i, chapter in enumerate(chapters):
        body_texts = _create_chapter_body(chapter)
        start_idx = 1 if i == 0 else 0
        for j in range(start_idx, len(chapter.photos)):
            photo = chapter.photos[j]
            blog_contents.append(BlogContent(image=photo.metadata.url, text=body_texts[j]))
        
        if i < len(chapters) - 1:
            transition_text = _create_transition(chapter, chapters[i+1])
            blog_contents.append(BlogContent(image="", text=transition_text))

    untimed_section = _create_untimed_section(untimed_photos)
    blog_contents.extend(untimed_section)

    closing_text = _create_closing(city, chapters[-1])
    blog_contents.append(BlogContent(image="", text=closing_text))

    final_contents = []
    for content in blog_contents:
        if not content.image and final_contents:
            final_contents[-1].text += content.text
        else:
            final_contents.append(content)

    summary_comment = opening_text
    return final_contents, summary_comment