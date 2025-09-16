# app/services/ai_model_service.py
import torch
from pathlib import Path
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration
from ultralytics import YOLO
import torchvision.models as models
import torchvision.transforms as transforms
from typing import List, Dict

from app.config import MODELS_DIR, DATA_DIR

class AIModelService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIModelService, cls).__new__(cls)
            cls._instance._initialize_models()
        return cls._instance

    def _initialize_models(self):
        """모든 AI 모델을 로드하여 초기화합니다."""
        print("AI 모델을 로딩 중입니다...")
        self.device = "cuda" if torch.cuda.is_available() else "cpu"
        
        # 1. YOLOv8 모델 로드
        yolo_path = MODELS_DIR / "yolov8n.pt"
        self.yolo_model = YOLO(yolo_path)

        # 2. Places365 (ResNet18) 모델 로드
        places_model_path = MODELS_DIR / "resnet18_places365.pth.tar"
        self.places_model = models.resnet18(num_classes=365)
        checkpoint = torch.load(places_model_path, map_location=lambda storage, loc: storage)
        state_dict = {str.replace(k, 'module.', ''): v for k, v in checkpoint['state_dict'].items()}
        self.places_model.load_state_dict(state_dict)
        self.places_model.eval()
        
        # Places365 라벨 로드
        categories_path = DATA_DIR / "categories_places365.txt"
        with open(categories_path) as f:
            self.places_categories = [line.strip().split(' ')[0][3:] for line in f]

        self.places_transform = transforms.Compose([
            transforms.Resize((256, 256)),
            transforms.CenterCrop(224),
            transforms.ToTensor(),
            transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])

        # 3. BLIP 모델 로드
        blip_model_id = "Salesforce/blip-image-captioning-large"
        self.blip_processor = BlipProcessor.from_pretrained(blip_model_id)
        self.blip_model = BlipForConditionalGeneration.from_pretrained(blip_model_id)
        
        print("AI 모델 로딩 완료.")

    def predict(self, image_path: Path) -> Dict:
        """이미지 경로를 받아 모든 모델로 분석하고 결과를 반환합니다."""
        try:
            img = Image.open(image_path).convert("RGB")

            # YOLO 예측
            yolo_results = self.yolo_model.predict(img, verbose=False)[0]
            yolo_objects = [yolo_results.names[int(c)] for c in yolo_results.boxes.cls]
            
            # Places365 예측
            img_tensor = self.places_transform(img).unsqueeze(0)
            with torch.no_grad():
                output = self.places_model(img_tensor)
            _, pred = output.topk(1, 1, True, True)
            place_type = self.places_categories[pred[0][0]]

            # BLIP 예측
            inputs = self.blip_processor(images=img, return_tensors="pt")
            out = self.blip_model.generate(**inputs, max_new_tokens=50)
            caption = self.blip_processor.decode(out[0], skip_special_tokens=True)

            return {
                "yolo_objects": list(set(yolo_objects))[:5], # 중복제거 후 최대 5개
                "place_type": place_type,
                "caption": caption
            }
        except Exception as e:
            print(f"ERROR: AI 모델 예측 실패 - {image_path}: {e}")
            return {
                "yolo_objects": [],
                "place_type": "장소",
                "caption": "사진을 분석하는 데 실패했어요."
            }

# 앱 전체에서 공유할 모델 서비스 인스턴스 생성
ai_models = AIModelService()