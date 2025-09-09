# app/services/main_blip.py
import os
from pathlib import Path
from typing import List, Tuple, Dict, Optional

import torch
from PIL import Image
from ultralytics import YOLO
from torchvision import models, transforms
from transformers import BlipProcessor, BlipForConditionalGeneration

# ====== 경로 설정 ======
BASE_DIR = Path(__file__).resolve().parent  # services/
ROOT_DIR = BASE_DIR.parent.parent           # AI/
PLACES_DIR = ROOT_DIR / "weights" / "places365"
PLACES_WEIGHT_PATH = PLACES_DIR / "resnet18_places365.pth.tar"
PLACES_CLASSES_PATH = PLACES_DIR / "categories_places365.txt"

# ====== blog_generator import ======
from app.services.blog_generator import make_blog_batch

# ====== 전역 캐시 ======
_YOLO: Optional[YOLO] = None
_PLACES_MODEL = None
_PLACES_CLASSES_EN: List[str] = []
_CAPTION_MODEL = None
_CAPTION_PROCESSOR = None

# ====== (선택) CPU 스레드 제한 ======
try:
    torch.set_num_threads(max(1, os.cpu_count() // 2))
except Exception:
    pass

# ----------------- YOLO -----------------
def _resolve_yolo_weights() -> str:
    for cand in ["yolov8n.pt", "yolo8n.pt"]:
        p = ROOT_DIR / "weights" / cand
        if p.exists():
            return str(p)
    return "yolov8n.pt"  # fallback

def _load_yolo() -> YOLO:
    global _YOLO
    if _YOLO is None:
        _YOLO = YOLO(_resolve_yolo_weights())
    return _YOLO

def run_yolo(img_path: Path) -> List[str]:
    model = _load_yolo()
    results = model(str(img_path))
    object_kor_map = {
        'person': '사람', 'dog': '강아지', 'cat': '고양이', 'car': '자동차',
        'backpack': '배낭', 'bench': '벤치', 'bicycle': '자전거'
    }
    detected = set()
    for box in results[0].boxes:
        cls_id = int(box.cls[0])
        name = model.names[cls_id]
        detected.add(object_kor_map.get(name, name))
    return list(detected)

# ----------------- Places365 -----------------
def _load_places():
    global _PLACES_MODEL, _PLACES_CLASSES_EN
    if not PLACES_WEIGHT_PATH.exists() or not PLACES_CLASSES_PATH.exists():
        raise RuntimeError("Places365 weight가 weights/places365/ 아래에 없습니다.")
    if not _PLACES_CLASSES_EN:
        with open(PLACES_CLASSES_PATH, encoding="utf-8") as f:
            for line in f:
                raw = line.strip().split(' ')[0]
                _PLACES_CLASSES_EN.append(raw.split('/')[-1])

    if _PLACES_MODEL is None:
        model = models.resnet18(num_classes=365)
        checkpoint = torch.load(PLACES_WEIGHT_PATH, map_location='cpu')
        model.load_state_dict(checkpoint['state_dict'], strict=False)
        model.eval()
        _PLACES_MODEL = model
    return _PLACES_MODEL, _PLACES_CLASSES_EN

def run_places(img_path: Path) -> Tuple[List[str], List[str]]:
    model, classes_en = _load_places()
    transform = transforms.Compose([
        transforms.Resize((256, 256)),
        transforms.CenterCrop(224),
        transforms.ToTensor(),
        transforms.Normalize([0.485, 0.456, 0.406],
                             [0.229, 0.224, 0.225])
    ])
    img = Image.open(img_path).convert("RGB")
    input_tensor = transform(img).unsqueeze(0)
    with torch.no_grad():
        output = model(input_tensor)
        top5 = torch.topk(output, 5)[1][0].tolist()
        detected_en = [classes_en[i] for i in top5]

    scene_kor_map = {
        'beach': '해변', 'boardwalk': '산책로', 'field_road': '시골길',
        'vineyard': '포도밭', 'wheat_field': '밀밭', 'church': '교회',
        'coffee_shop': '카페', 'cafe': '카페', 'teahouse': '찻집',
        'forest_road': '숲길', 'lagoon': '라군', 'swamp': '습지',
        'beach_house': '해변가 작은 집', 'oilrig': '해상 시추 시설',
        'indoor': '실내', 'outdoor': '야외', 'natural': '자연',
        'supermarket': '슈퍼마켓', 'drugstore': '약국', 'living_room': '거실',
        'science_museum': '과학박물관', 'amusement_arcade': '오락실',
        'car_interior': '차 안', 'ballroom': '무도회장', 'cliff': '절벽',
        'hot_spring': '온천', 'playroom': '놀이방', 'raft': '뗏목',
        'wet_bar': '바 테이블', 'food_court': '푸드코트'
    }
    detected_ko = [scene_kor_map.get(k, k) for k in detected_en]
    return detected_en, detected_ko

# ----------------- Caption (BLIP base) -----------------
CAPTION_MODEL_NAME = "Salesforce/blip-image-captioning-base"

def _load_caption_model(device: str = "cpu"):
    global _CAPTION_MODEL, _CAPTION_PROCESSOR
    if _CAPTION_MODEL is None or _CAPTION_PROCESSOR is None:
        _CAPTION_PROCESSOR = BlipProcessor.from_pretrained(CAPTION_MODEL_NAME)
        _CAPTION_MODEL = BlipForConditionalGeneration.from_pretrained(CAPTION_MODEL_NAME)
        _CAPTION_MODEL.to(device).eval()
    return _CAPTION_MODEL, _CAPTION_PROCESSOR

def run_caption(img_path: Path, max_new_tokens: int = 25) -> str:
    device = "cuda" if torch.cuda.is_available() else "cpu"
    model, processor = _load_caption_model(device)
    image = Image.open(img_path).convert("RGB")
    with torch.no_grad():
        inputs = processor(images=image, return_tensors="pt").to(device)
        out = model.generate(**inputs, max_new_tokens=max_new_tokens)
        return processor.decode(out[0], skip_special_tokens=True)

# ----------------- Public API -----------------
def analyze_image(img_path: Path) -> Dict:
    yolo = run_yolo(img_path)
    places_en, places_ko = run_places(img_path)
    places_combined = list(dict.fromkeys(places_en + places_ko))
    caption = run_caption(img_path, max_new_tokens=25)
    return {
        "path": str(img_path),
        "yolo": yolo,
        "places_en": places_en,
        "places_ko": places_ko,
        "places": places_combined,
        "caption": caption
    }

def analyze_images(paths: List[Path]) -> List[Dict]:
    return [analyze_image(p) for p in paths]

def make_blog_from_paths(paths: List[Path], city: str = "OO도시") -> Dict:
    photos = analyze_images(paths)
    pg_photos = [{"yolo": p["yolo"], "places": p["places"], "caption": p["caption"]} for p in photos]
    blog_text = make_blog_batch(pg_photos, city=city)
    return {"blog_text": blog_text, "photos": photos}
