from typing import List

def make_summary_comment(photo_infos: List[dict], city: str = "이 도시") -> str:
    """
    사진 캡션 기반 감성 요약 멘트를 생성합니다.
    - photo_infos: {"caption": str, "yolo": List[str], "places": str} 리스트
    - city: 도시명 (예: "서울", "제주도")

    리턴: 감성적인 한 문장 요약 텍스트
    """

    # 모든 caption을 긴 문장으로 이어 붙이기
    captions = [" ".join(p["caption"]) for p in photo_infos if "caption" in p and isinstance(p["caption"], list)]
    full_text = " ".join(captions).lower()

    # 키워드 기반 감성 문장 생성
    if "park" in full_text or "trail" in full_text or "green" in full_text:
        return f"{city}의 자연을 함께 거닐며 마음까지 여유로워지는 여행이었네요 🍃"
    elif "cafe" in full_text or "coffee" in full_text or "dessert" in full_text:
        return f"{city}의 감성 가득한 카페에서 따뜻한 대화를 나눈 하루였어요 ☕"
    elif "sunset" in full_text or "beach" in full_text or "sky" in full_text:
        return f"{city}의 노을과 함께 하루를 마무리하며 잊지 못할 기억을 남기셨겠어요 🌅"
    elif "museum" in full_text or "exhibit" in full_text:
        return f"{city}에서 예술과 문화를 느끼며 깊은 영감을 받은 하루였겠네요 🎨"
    elif "market" in full_text or "street" in full_text or "food" in full_text:
        return f"{city}의 거리를 걸으며 다양한 먹거리와 풍경을 만끽한 여행이었네요 🍜"
    elif "temple" in full_text or "history" in full_text or "palace" in full_text:
        return f"{city}의 역사를 따라 걷다보니 시간여행을 한 듯한 하루였어요 🏛️"
    else:
        return f"{city}에서 함께한 하루, 그 자체로도 충분히 소중한 시간이었겠네요 😊"
