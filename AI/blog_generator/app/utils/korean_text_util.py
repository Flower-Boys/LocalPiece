import random

PLACE_MAP = {
    "temple": "사찰", "church": "교회", "park": "공원", "beach": "해변",
    "cafe": "카페", "restaurant": "근사한 레스토랑", "bar": "멋진 바",
    "museum": "박물관", "gallery": "미술관", "library": "도서관",
    "tower": "전망대", "bridge": "다리", "street": "활기 넘치는 거리", "market": "북적이는 시장"
}

OBJECT_MAP = {
    "person": "정겨운 사람들", "car": "거리를 지나는 자동차", "chair": "잠시 쉬어갈 수 있는 의자",
    "table": "이야기가 오가는 테이블", "tree": "푸른 나무", "flower": "예쁜 꽃",
    "boat": "유유히 떠가는 보트", "building": "멋진 건물"
}

def translate_place(place: str) -> str:
    """Places365 라벨을 한국어로 변환합니다."""
    main_place = place.split('/')[0]
    return PLACE_MAP.get(main_place, main_place)

def translate_object(obj: str) -> str:
    """YOLO 객체 라벨을 한국어 문맥에 맞게 변환합니다."""
    return OBJECT_MAP.get(obj, obj)

# --- 문장 생성: 변환된 단어들로 감성적인 문장을 조립 ---
# (팀원분의 josa 함수를 그대로 활용)
def josa(word: str, pair=("은", "는")) -> str:
    """간단한 받침 판정 기반 조사(은/는, 이/가, 을/를) 부착 함수"""
    if not word: return pair[1]
    last_char = word[-1]
    if not '가' <= last_char <= '힣': return pair[1]
    has_batchim = (ord(last_char) - 0xAC00) % 28 != 0
    return pair[0] if has_batchim else pair[1]

def create_sentence_for_photo(photo_analysis) -> str:
    """사진 분석 결과 하나로 감성적인 문장 한 개를 생성합니다."""
    place_ko = translate_place(photo_analysis.place_type)
    
    templates = [
        f"이곳 {place_ko}에서 마주한 풍경이에요. 정말 평화로운 분위기였어요.",
        f"이번 여행에서 가장 기억에 남는 장소 중 하나인 {place_ko}입니다.",
        f"잠시 발걸음을 멈추고 {place_ko}의 정취를 느껴보았어요."
    ]
    base_sentence = random.choice(templates)

    if photo_analysis.yolo_objects:
        main_object_ko = translate_object(photo_analysis.yolo_objects[0])
        obj_sentence = f" 특히 저 멀리 보이던 {main_object_ko}{josa(main_object_ko,('이','가'))} 인상 깊었답니다. 😊"
        return base_sentence + obj_sentence
    else:
        # BLIP 캡션을 보조 정보로 활용 (영어 부분 제거)
        return base_sentence + " 사진을 보니 그 때의 감정이 다시 떠오르네요."