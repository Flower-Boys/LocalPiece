# blog_generator.py
import re
from typing import Dict, List, Union

# -------------------------------
# 유틸
# -------------------------------


def is_korean_word(s: str) -> bool:
    return any('가' <= ch <= '힣' for ch in s)


def josa(word: str, pair=("은", "는")) -> str:
    """간단 받침 판정 기반 조사 부착"""
    if not word:
        return pair[1]
    ch = word[-1]
    if not ('가' <= ch <= '힣'):
        return pair[1]
    has_batchim = (ord(ch) - 0xAC00) % 28 != 0
    return pair[0] if has_batchim else pair[1]


# -------------------------------
# Places365 라벨 → 한국어 변환(확장 휴리스틱)
# -------------------------------
# 1) 자주 나오는 정확 매핑
SCENE_EXACT_MAP = {
    # 자연/지형
    "natural": "자연", "outdoor": "야외", "indoor": "실내",
    "mountain": "산", "valley": "계곡", "river": "강", "lake": "호수",
    "waterfall": "폭포", "desert": "사막", "forest": "숲", "forest_road": "숲길",
    "canyon": "협곡", "cliff": "절벽", "island": "섬", "glacier": "빙하",
    "snowfield": "설원", "beach": "해변", "coast": "해안", "lagoon": "라군",
    "swamp": "습지", "field": "들판", "wheat_field": "밀밭", "rice_field": "논",
    "vineyard": "포도밭", "park": "공원", "playground": "놀이터",

    # 도시/교통/건물
    "street": "거리", "alley": "골목", "highway": "고속도로", "roundabout": "로터리",
    "bridge": "다리", "harbor": "항구", "airport_terminal": "공항 터미널", "runway": "활주로",
    "train_station": "기차역", "subway_station": "지하철역", "parking_garage": "주차장",
    "stadium": "경기장", "ballroom": "무도회장", "theater": "극장", "concert_hall": "콘서트홀",

    # 실내공간
    "living_room": "거실", "dining_room": "식당", "bedroom": "침실", "kitchen": "주방",
    "bathroom": "욕실", "office": "사무실", "library": "도서관",
    "bookstore": "서점", "supermarket": "슈퍼마켓", "drugstore": "약국",
    "bakery": "빵집", "butcher_shop": "정육점", "market": "시장",
    "bank_vault": "금고실", "science_museum": "과학박물관", "museum": "박물관",
    "aquarium": "수족관", "church": "교회", "mosque": "모스크", "temple": "사원",
    "coffee_shop": "카페", "cafe": "카페", "teahouse": "찻집",

    # 기타
    "beach_house": "해변가 작은 집", "oilrig": "해상 시추 시설",
    "boardwalk": "산책로", "amusement_arcade": "오락실",
}

# 2) 토큰/접미사 기반 휴리스틱
TOKEN_MAP = {
    "train": "기차",
    "subway": "지하철",
    "car": "차",
    "bus": "버스",
    "airplane": "비행기",
    "boat": "보트",
    "bridge": "다리",
    "mountain": "산",
    "beach": "해변",
    "river": "강",
    "lake": "호수",
    "forest": "숲",
    "desert": "사막",
    "cave": "동굴",
    "castle": "성",
    "garden": "정원",
    "harbor": "항구",
    "temple": "사원",
    "church": "교회",
    "museum": "박물관",
    "library": "도서관",
    "kitchen": "주방",
    "bedroom": "침실",
    "living": "거실",
    "dining": "식당",
    "office": "사무실",
    "market": "시장",
    "supermarket": "슈퍼마켓",
    "drugstore": "약국",
    "bank": "은행",
    "vault": "금고실",
    "theater": "극장",
    "stadium": "경기장",
    "arcade": "오락실",
}


def translate_scene_label(label: str) -> str:
    """
    Places365 라벨을 한국어로 최대한 자연스럽게 변환.
    1) 정확 매핑 → 2) interior 패턴 → 3) 토큰 조합 → 4) 실패 시 원문 그대로
    """
    if not label:
        return "어느 장소"
    # 이미 한글이면 그대로
    if is_korean_word(label):
        return label

    # 1) 정확 매핑
    if label in SCENE_EXACT_MAP:
        return SCENE_EXACT_MAP[label]

    # 2) 'xxx_interior', 'xxx_exterior' 패턴
    if label.endswith("_interior"):
        base = label.replace("_interior", "")
        base_ko = SCENE_EXACT_MAP.get(base) or TOKEN_MAP.get(base) or base
        return f"{base_ko} 안"
    if label.endswith("_exterior"):
        base = label.replace("_exterior", "")
        base_ko = SCENE_EXACT_MAP.get(base) or TOKEN_MAP.get(base) or base
        return f"{base_ko} 바깥"

    # 3) 토큰 조합(underscore 분해)
    tokens = label.split("_")
    ko_tokens = [SCENE_EXACT_MAP.get(
        t) or TOKEN_MAP.get(t) or t for t in tokens]
    ko = "".join(ko_tokens)
    # 예외적으로 단어 사이 공백이 자연스러운 케이스 보정
    if " " not in ko and len(ko) > 2:
        # 보편적으로 붙여도 무난하지만, 일부는 공백이 나은 경우 처리
        if any(t in tokens for t in ["living", "dining", "meeting"]):
            ko = " ".join(ko_tokens)
    return ko


# -------------------------------
# BLIP 캡션 간단 한국어화(규칙 기반)
# -------------------------------
# 자주 나오는 패턴 매핑 (정규식 → 한국어 문장)
CAPTION_PATTERNS = [
    (r"\ba couple (?:is )?sitting .* (?:sunset|sun set)\b", "우리는 석양을 바라보며 나란히 앉아 있었다."),
    (r"\ba couple .* dancing .* ballroom\b", "우리는 무도회장에서 함께 춤을 췄다."),
    (r"\ba couple .* kissing .*", "우리는 서로 입맞추며 순간을 남겼다."),
    (r".*watching the sunset.*", "석양을 바라보며 잠시 발걸음을 멈췄다."),
]

# 단어 레벨 간단 사전
WORD_MAP = {
    "couple": "우리는",
    "man": "남자는",
    "woman": "여자는",
    "people": "사람들이",
    "person": "사람이",
    "sitting": "앉아",
    "standing": "서서",
    "walking": "걸으며",
    "kissing": "입맞추며",
    "dancing": "춤을 추며",
    "holding": "손에 들고",
    "looking": "바라보며",
    "watching": "바라보며",
    "smiling": "미소 지으며",
    "bridge": "다리 위에서",
    "mountain": "산 앞에서",
    "beach": "해변에서",
    "river": "강가에서",
    "lake": "호숫가에서",
    "ocean": "바닷가에서",
    "sunset": "석양을",
    "sunrise": "여명을",
    "together": "함께",
    "ballroom": "무도회장에서",
    "park": "공원에서",
}


def caption_en_to_ko(caption: str) -> str:
    if not caption:
        return ""
    s = caption.strip().lower()

    # 1) 정규식 패턴 우선 적용
    for pat, ko in CAPTION_PATTERNS:
        if re.search(pat, s):
            return ko

    # 2) 단순 치환 기반 조립
    tokens = re.split(r"[\s,]+", s)
    mapped = []
    for t in tokens:
        # 전처리: 특수문자 제거
        t = re.sub(r"[^a-z_]+", "", t)
        if not t:
            continue
        mapped.append(WORD_MAP.get(t, ""))

    # 불용/빈 토큰 제거 후 자연스러운 문장 만들기
    mapped = [m for m in mapped if m]
    if not mapped:
        # 3) 실패 시 요약형 Fallback
        return "그 순간을 사진으로 남겼다."
    sent = " ".join(mapped)
    # 간단한 후처리
    sent = sent.replace("우리는 우리는", "우리는").replace("  ", " ").strip()
    if not sent.endswith("다."):
        sent += "다."
    return sent

# -------------------------------
# 이벤트 태깅 확장 (영/한 동시)
# -------------------------------


def tag_events(yolo: List[str], places: List[str], caption: str) -> List[str]:
    tags = []
    lowcap = (caption or "").lower()

    places_set = set(places) | {p.lower() for p in places}
    yolo_set = set(yolo) | {y.lower() for y in yolo}

    # 장소 이벤트
    if {"cafe", "coffee_shop", "teahouse", "카페", "찻집"} & places_set:
        tags.append("CAFE_VISIT")
    if {"beach", "해변", "beach_house", "해변가 작은 집"} & places_set:
        tags.append("BEACH_SCENE")
    if {"forest_road", "숲길", "forest", "숲"} & places_set:
        tags.append("FOREST_WALK")
    if {"mountain", "산"} & places_set:
        tags.append("MOUNTAIN_VIEW")

    # 객체/상황 이벤트
    if {"dog", "강아지"} & yolo_set or "dog" in lowcap:
        tags.append("DOG_SPOTTED")
    if any(k in lowcap for k in ["ice cream", "ice-cream", "gelato"]):
        tags.append("ICECREAM_BUY")
    if any(k in lowcap for k in ["dropped", "fell", "spill", "spilled", "broken"]):
        tags.append("MISHAP")
    if "sunset" in lowcap:
        tags.append("SUNSET")
    if "kissing" in lowcap:
        tags.append("KISSING")
    if "dancing" in lowcap or "ballroom" in lowcap:
        tags.append("DANCING")

    return tags


# -------------------------------
# 문장 뱅크(확장)
# -------------------------------
PHRASEBANK = {
    "INTRO_1": "오늘 우리는 {도시}{{을/를}} 여행했다.",
    "INTRO_2": "첫 발걸음은 {첫장소}{{에서/에서}} 시작됐다.",

    "CONNECTIVES": ["그리고", "이어서", "잠시 후", "그러다", "한참을 걷다가", "조금 지나", "우연히", "문득", "옆길로 들어서", "멀리 보이던 곳으로"],

    "CAFE_VISIT": [
        "작은 카페에 들러 아메리카노{을/를} 손에 쥐고 한숨 돌렸다.",
        "창가 자리에서 골목을 바라보며 잠깐 수다를 나눴다."
    ],
    "BEACH_SCENE": [
        "해변 바람이 촉촉하게 스쳤다.",
        "모래 위에서 파도 소리를 들으며 잠시 쉬어 갔다."
    ],
    "FOREST_WALK": [
        "숲길{을/를} 따라 천천히 걸으며 숨을 골랐다.",
        "나무 사이로 스며드는 빛을 바라보며 발걸음이 가벼워졌다."
    ],
    "MOUNTAIN_VIEW": [
        "산 능선 위로 구름이 느리게 흘렀다.",
        "바람이 불어와 산내음이 묻어났다."
    ],
    "DOG_SPOTTED": [
        "우연히 만난 강아지{를/을} 쓰다듬으며 한참을 웃었다.",
        "가게 앞에서 강아지{이/가} 꼬리를 흔들어 마음이 포근해졌다."
    ],
    "ICECREAM_BUY": [
        "디저트로 아이스크림{을/를} 골라 들고 골목을 천천히 걸었다.",
        "달콤한 아이스크림 한 입이 남은 피로{를/을} 녹여 주었다."
    ],
    "MISHAP": [
        "그런데 아이스크림{이/가} 손에서 미끄러져 바닥에 떨어졌다.",
        "순간 속이 상했지만 서로 얼굴을 마주 보고 금세 웃어버렸다."
    ],
    "SUNSET": [
        "석양빛이 유리창에 비쳐 하루가 천천히 가라앉았다.",
        "주황빛 하늘 아래 발걸음을 잠시 멈췄다."
    ],
    "KISSING": [
        "서로의 어깨를 감싸 안고 조용히 입맞추었다.",
    ],
    "DANCING": [
        "음악에 맞춰 발을 맞대며 함께 춤을 췄다.",
    ],
    "FALLBACK": [
        "{caption_ko}"
    ]
}

# -------------------------------
# 슬롯/조사 적용
# -------------------------------


def apply_josa(template: str) -> str:
    def repl(m):
        token = m.group(0)  # 예: {을/를}
        pair = tuple(token.strip("{}").split("/"))
        return f"<<J:{pair[0]}|{pair[1]}>>"
    s = re.sub(r"\{[^}]+/[^}]+\}", repl, template)
    while "<<J:" in s:
        s = re.sub(r"(\S+)\s*<<J:([^>|]+)\|([^>]+)>>",
                   lambda m: m.group(1) + josa(m.group(1),
                                               (m.group(2), m.group(3))),
                   s, count=1)
    return s

# -------------------------------
# 장소 선택/문장 빌더
# -------------------------------


def pick_place_ko(places: List[str]) -> str:
    if not places:
        return "어느 길"
    # 한국어 우선
    for p in places:
        if is_korean_word(p):
            return p
        # 영문이면 변환 시도
        tr = translate_scene_label(p)
        if tr != p:
            return tr
    # 모두 실패하면 첫 항목
    label = places[0]
    return translate_scene_label(label)


def place_move_sentence(place_ko: str) -> str:
    return f"{place_ko}{josa(place_ko, ('으로', '로'))} 발길을 옮겼고"


def event_sentences(tags: List[str], caption: str) -> List[str]:
    sents = []
    if tags:
        for t in tags:
            sents.extend(PHRASEBANK.get(t, []))
    else:
        # 캡션 한국어화 후 Fallback
        sents.append(PHRASEBANK["FALLBACK"][0].format(
            caption_ko=caption_en_to_ko(caption)))
    # 조사 적용
    return [apply_josa(x) for x in sents]

# -------------------------------
# 단일/다장 본문 생성
# -------------------------------


def make_blog(photo: Dict, city: str = "OO도시") -> str:
    yolo, places, caption = photo.get("yolo", []), photo.get(
        "places", []), photo.get("caption", "")
    tags = tag_events(yolo, places, caption)

    first_place = pick_place_ko(places)
    parts = []
    parts.append(apply_josa(PHRASEBANK["INTRO_1"].format(도시=city)))
    parts.append(apply_josa(PHRASEBANK["INTRO_2"].format(첫장소=first_place)))
    parts.extend(event_sentences(tags, caption))
    # 마무리
    last_place = pick_place_ko(places[::-1]) if places else "풍경"
    parts.append(
        f"하루의 끝에서 {last_place}{josa(last_place, ('의', '의'))} 잔상을 떠올리며 여정을 마무리했다.")
    return " ".join(parts)


def make_blog_batch(photos: List[Dict], city: str = "OO도시", return_list: bool = False) -> Union[str, List[str]]:
    if not photos:
        return "" if not return_list else []

    if return_list:
        # 사진마다 독립적으로 make_blog() 호출해서 리스트로 반환
        return [make_blog(p, city=city) for p in photos]

    # 도입 (첫 사진)
    first_places = photos[0].get("places", [])
    first_place_ko = pick_place_ko(first_places)
    intro = " ".join([
        apply_josa(PHRASEBANK["INTRO_1"].format(도시=city)),
        apply_josa(PHRASEBANK["INTRO_2"].format(첫장소=first_place_ko)),
    ])

    # 중간 본문
    bodies = []
    conns = PHRASEBANK["CONNECTIVES"]
    for idx in range(1, max(1, len(photos) - 1)):
        conn = conns[(idx - 1) % len(conns)]
        p = photos[idx]
        place_ko = pick_place_ko(p.get("places", []))
        line = f"{conn} {place_move_sentence(place_ko)} "
        line += " ".join(event_sentences(tag_events(p.get("yolo", []), p.get("places", []), p.get("caption", "")),
                                         p.get("caption", "")))
        bodies.append(line.strip())

    # 마지막 사진
    last = photos[-1]
    last_place_ko = pick_place_ko(last.get("places", []))
    last_lines = []
    if len(photos) > 1:
        last_lines.append(
            f"{conns[(len(photos) - 2) % len(conns)]} {place_move_sentence(last_place_ko)}")
    last_lines += event_sentences(tag_events(last.get("yolo", []), last.get("places", []), last.get("caption", "")),
                                  last.get("caption", ""))
    last_lines.append(
        f"하루의 끝에서 {last_place_ko}{josa(last_place_ko, ('의', '의'))} 잔상을 떠올리며 여정을 마무리했다.")

    return " ".join([intro] + bodies + [" ".join(last_lines)])
