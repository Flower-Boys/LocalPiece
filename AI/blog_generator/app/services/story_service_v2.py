import random
from typing import List, Tuple
from app.models import BlogContent, Chapter, AnalyzedPhoto

# 팀원분의 똑똑한 한글 로직을 핵심 엔진으로 완벽하게 활용합니다!
from app.services.blog_generator import (
    josa,
    pick_place_ko,
    event_sentences,
    tag_events,
    PHRASEBANK,
    apply_josa
)

def _get_time_greeting(hour: int) -> str:
    """시간대에 맞는 인사말을 생성합니다."""
    if 5 <= hour < 12: return "아침 햇살과 함께"
    if 12 <= hour < 17: return "나른하고 여유로운 오후"
    if 17 <= hour < 21: return "아름다운 노을이 물드는 저녁"
    return "고요한 밤의 정취 속에서"

def write_upgraded_story(city: str, chapters: List[Chapter], untimed_photos: List[AnalyzedPhoto]) -> Tuple[List[BlogContent], str]:
    """
    사진 1장당 하나의 자연스러운 블로그 본문을 생성하는 최종 V2 로직
    """
    if not chapters:
        return [], "시간 정보가 있는 사진이 없어 업그레이드된 블로그를 생성할 수 없습니다."

    blog_contents = []
    all_photos_in_order = [photo for chapter in chapters for photo in chapter.photos]
    
    # --- 1. 오프닝 문장 생성 ---
    # 카카오 API로 찾은 실제 장소 이름을 사용, 실패 시 AI 분석 결과 사용
    first_chapter_place_name = chapters[0].place_name if chapters[0].place_name != "기억에 남는 장소" else pick_place_ko([p.place_type for p in chapters[0].photos])
    opening_text = PHRASEBANK["INTRO_1"].format(도시=city) + " " + PHRASEBANK["INTRO_2"].format(첫장소=first_chapter_place_name)
    opening_text = apply_josa(opening_text)
    
    # --- 2. 각 사진에 대한 본문 생성 및 1:1 매칭 ---
    for i, photo in enumerate(all_photos_in_order):
        # ✨ 팀원분의 event_sentences 로직을 사용하여 어색한 번역투가 아닌, 자연스러운 문장 생성!
        tags = tag_events(photo.yolo_objects, [photo.place_type], photo.caption)
        sentences = event_sentences(tags, photo.caption)
        body_text = " ".join(sentences)
        
        final_text = ""
        # 첫 번째 사진에만 오프닝 텍스트를 함께 붙여줍니다.
        if i == 0:
            final_text += opening_text + "\n\n"
        
        final_text += body_text

        # 현재 사진이 챕터의 마지막 사진이고, 다음 챕터가 있을 때 전환 문장을 추가합니다.
        current_chapter_index = next((idx for idx, chap in enumerate(chapters) if photo in chap.photos), -1)
        if current_chapter_index != -1 and photo == chapters[current_chapter_index].photos[-1] and current_chapter_index < len(chapters) - 1:
            next_chapter = chapters[current_chapter_index + 1]
            # 카카오 API 결과를 우선 사용
            from_place_ko = chapters[current_chapter_index].place_name if chapters[current_chapter_index].place_name != "기억에 남는 장소" else pick_place_ko([p.place_type for p in chapters[current_chapter_index].photos])
            to_place_ko = next_chapter.place_name if next_chapter.place_name != "기억에 남는 장소" else pick_place_ko([p.place_type for p in next_chapter.photos])
            conn = random.choice(PHRASEBANK["CONNECTIVES"])
            transition_text = f"\n\n{conn}, {to_place_ko}{josa(to_place_ko, ('으로','로'))} 발길을 옮겼어요."
            final_text += transition_text

        blog_contents.append(BlogContent(image=photo.metadata.url, text=final_text))

    # --- 3. 클로징 문장 추가 ---
    last_place_ko = chapters[-1].place_name if chapters[-1].place_name != "기억에 남는 장소" else pick_place_ko([p.place_type for p in chapters[-1].photos])
    closing_text = f"\n\n하루의 끝에서 {last_place_ko}{josa(last_place_ko, ('의','의'))} 잔상을 떠올리며 여정을 마무리합니다."
    blog_contents[-1].text += closing_text

    summary_comment = opening_text
    return blog_contents, summary_comment