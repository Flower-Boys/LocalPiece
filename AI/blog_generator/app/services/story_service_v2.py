import re
from typing import List, Tuple, Dict
from app.models import BlogContent, AnalyzedPhoto
from app.services.ai_model_service import ai_models

def _create_exaone_prompt(city: str, analysis_keywords: Dict, place_name: str = None) -> str:
    """
    [최종 버전] AI에게 '블로거 제니'라는 역할을 부여하고, 키워드를 직접 언급하지 않도록 지시하여
    가장 자연스러운 글을 생성하도록 유도하는 프롬프트.
    """
    if place_name:
        topic_title = place_name
    else:
        keywords = list(set(analysis_keywords.get("place_type", []) + analysis_keywords.get("yolo_objects", [])))
        topic_title = ", ".join(keywords[:2]) if keywords else city

    # AI에게 역할을 부여하고, 대화 형식으로 지시하여 규칙을 강제하는 프롬프트
    prompt = (
        f"**[상황]**\n"
        f"너는 지금부터 20대 여행 블로거 '제니'야. 나는 너의 블로그 글을 검수하는 편집장이야.\n"
        f"내가 주는 주제를 보고, 아래 **[제니의 글쓰기 스타일]**을 완벽하게 지켜서 블로그 본문만 작성해줘.\n\n"
        f"**[오늘의 주제]**\n"
        f"'{topic_title}' 방문 후기\n\n"
        f"**[제니의 글쓰기 스타일]**\n"
        f"1. **100% 한국어 사용**: 영어 단어는 절대 쓰지 않아. 항상 순우리말이나 자연스러운 한국어로 표현해.\n"
        f"2. **친한 친구 같은 반말**: 모든 문장은 '~했어', '~같아' 같이 친근하고 솔직한 반말로만 써야 해. 존댓말과 절대 섞어 쓰지 마.\n"
        f"3. **자연스러운 묘사**: 주제와 관련된 키워드를 글에 직접적으로 언급하지 마. 대신, 그 키워드에서 느껴지는 분위기나 감정을 자연스럽게 묘사해줘.\n"
        f"4. **분량**: 글은 2~3개의 문장으로만 짧고 간결하게 작성해.\n"
        f"5. **마무리**: 글의 마지막에는 항상 귀여운 이모티콘(✨, 😊, 📸)을 한 개만 붙여.\n\n"
        f"**[편집장 지시]**\n"
        f"자, 제니! 위의 스타일을 완벽하게 지켜서, 주제에 대한 본문을 작성해봐. 시작!"
    )
    return prompt

def write_story(city: str, timed_photos: List[AnalyzedPhoto], untimed_photos: List[AnalyzedPhoto]) -> Tuple[List[BlogContent], str]:
    all_photos_in_order = timed_photos + untimed_photos
    if not all_photos_in_order:
        return [], "블로그를 생성할 사진이 없습니다."

    blog_contents = []

    for photo in all_photos_in_order:
        prompt = _create_exaone_prompt(city, photo.analysis, photo.place_name)
        # AI가 글을 생성
        blog_sentence = ai_models.generate_korean_text_from_keywords(prompt)

        # 간단한 후처리: 앞뒤 공백 및 따옴표 제거
        blog_sentence = blog_sentence.strip().strip('"')

        final_text = ""
        if photo.place_name:
            final_text += f"📍 {photo.place_name}\n\n"
        
        # 만약 문장이 비어있다면, 기본 메시지를 표시
        if not blog_sentence:
            blog_sentence = "이곳에서의 순간을 사진으로 담아봤어. 😊"

        final_text += blog_sentence

        blog_contents.append(BlogContent(image=photo.metadata.url, text=final_text))

    summary_comment = "AI가 생성한 여행의 순간들"
    if blog_contents:
        summary_comment = blog_contents[0].text.split('\n\n')[-1].split('.')[0] + '.'

    return blog_contents, summary_comment