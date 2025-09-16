import random
from datetime import datetime
from typing import List, Tuple
from app.models import BlogContent, Chapter, AnalyzedPhoto
from app.services import blog_generator as OriginalGenerator

from app.services.blog_generator import (
    josa,
    pick_place_ko,
    event_sentences,
    tag_events,
    PHRASEBANK
)

def _get_time_greeting(hour: int) -> str:
    if 5 <= hour < 12: return "아침 햇살과 함께"
    if 12 <= hour < 17: return "나른하고 여유로운 오후"
    if 17 <= hour < 21: return "아름다운 노을이 물드는 저녁"
    return "고요한 밤의 정취 속에서"

def write_upgraded_story(city: str, chapters: List[Chapter], untimed_photos: List[AnalyzedPhoto]) -> Tuple[List[BlogContent], str]:
    """
    팀원분의 한글 로직과 새로운 챕터 기능을 결합하여 블로그를 생성합니다.
    """
    if not chapters:
        # 시간 정보 없는 사진만 있는 경우, 오리지널 로직으로 간단히 처리
        original_result = OriginalGenerator.make_blog_batch(
            [p.__dict__ for p in untimed_photos], city=city, return_list=True
        )
        blog_contents = [BlogContent(image=untimed_photos[i].metadata.url, text=text) for i, text in enumerate(original_result)]
        return blog_contents, "이번 여행의 소중한 순간들을 모아봤어요."

    blog_contents = []
    
    # --- 오프닝: 팀원분의 PHRASEBANK 활용 ---
    first_chapter_place_ko = pick_place_ko([p.place_type for p in chapters[0].photos])
    opening_text = PHRASEBANK["INTRO_1"].format(도시=city) + " " + PHRASEBANK["INTRO_2"].format(첫장소=first_chapter_place_ko)
    opening_text = OriginalGenerator.apply_josa(opening_text)
    blog_contents.append(BlogContent(image=chapters[0].photos[0].metadata.url, text=opening_text))
    
    # --- 챕터 본문 및 전환 ---
    for i, chapter in enumerate(chapters):
        # 챕터의 사진들로 본문 생성
        for photo in chapter.photos:
            tags = tag_events(photo.yolo_objects, [photo.place_type], photo.caption)
            sentences = event_sentences(tags, photo.caption)
            body_text = " ".join(sentences)
            blog_contents.append(BlogContent(image=photo.metadata.url, text=body_text))

        # 다음 챕터로의 전환
        if i < len(chapters) - 1:
            next_chapter = chapters[i+1]
            from_place_ko = chapter.place_name
            to_place_ko = next_chapter.place_name
            conn = random.choice(PHRASEBANK["CONNECTIVES"])
            transition_text = f"\n{conn} {to_place_ko}{josa(to_place_ko, ('으로','로'))} 발길을 옮겼어요."
            blog_contents[-1].text += transition_text

    # --- 클로징 ---
    last_place_ko = chapters[-1].place_name
    closing_text = f"\n하루의 끝에서 {last_place_ko}{josa(last_place_ko, ('의','의'))} 잔상을 떠올리며 여정을 마무리합니다."
    blog_contents[-1].text += closing_text
    
    summary_comment = opening_text
    return blog_contents, summary_comment