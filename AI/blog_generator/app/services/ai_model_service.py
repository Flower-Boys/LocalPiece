import torch
from pathlib import Path
from PIL import Image
from transformers import BlipProcessor, BlipForConditionalGeneration, AutoTokenizer, AutoModelForCausalLM
from ultralytics import YOLO
import torchvision.models as models
import torchvision.transforms as transforms
from typing import Dict
import re

from app.config import MODELS_DIR, DATA_DIR

class AIModelService:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(AIModelService, cls).__new__(cls)
            # 👈 [수정 1] GPU가 없어도 항상 CPU로 모델을 초기화하도록 변경
            cls._instance._initialize_models()
        return cls._instance

    def _initialize_models(self):
        self.initialized = True
        # 👈 [수정 2] 사용할 장치를 'cpu'로 명확하게 지정
        self.device = "cpu"
        print(f"AI 모델을 {self.device} 환경에서 로딩합니다...")
        
        # --- 1. 시각 분석가 그룹 (YOLO, Places365, BLIP) ---
        print("  - 시각 분석가 로딩 중...")
        
        # YOLO 모델 로딩
        self.yolo_model = YOLO(MODELS_DIR / "yolov8n.pt")
        self.yolo_model.to(self.device) # 모델을 CPU로 이동

        # Places365 모델 로딩
        places_model_path = MODELS_DIR / "resnet18_places365.pth.tar"
        self.places_model = models.resnet18(num_classes=365)
        # 👈 [수정 3] CPU에서 모델 가중치를 불러오도록 map_location 설정
        checkpoint = torch.load(places_model_path, map_location=self.device)
        state_dict = {str.replace(k, 'module.', ''): v for k, v in checkpoint['state_dict'].items()}
        self.places_model.load_state_dict(state_dict)
        self.places_model.to(self.device) # 모델을 CPU로 이동
        self.places_model.eval()
        
        with open(DATA_DIR / "categories_places365.txt") as f:
            self.places_categories = [line.strip().split(' ')[0][3:] for line in f]
            
        self.places_transform = transforms.Compose([
            transforms.Resize((256, 256)), transforms.CenterCrop(224),
            transforms.ToTensor(), transforms.Normalize([0.485, 0.456, 0.406], [0.229, 0.224, 0.225])
        ])
        
        # BLIP 모델 로딩
        blip_model_id = "Salesforce/blip-image-captioning-base"
        self.blip_processor = BlipProcessor.from_pretrained(blip_model_id, use_fast=True)
        self.blip_model = BlipForConditionalGeneration.from_pretrained(blip_model_id).to(self.device)


        # --- 2. 한글 작가 (EXAONE) ---
        print("  - 한글 작가(EXAONE-4.0-1.2B) 로딩 중...")
        exaone_model_id = "LGAI-EXAONE/EXAONE-4.0-1.2B"
        
        self.exaone_tokenizer = AutoTokenizer.from_pretrained(exaone_model_id)
        # 👈 [수정 4] CPU 환경에 맞게 GPU 관련 옵션(torch_dtype, device_map) 제거
        self.exaone_model = AutoModelForCausalLM.from_pretrained(exaone_model_id).to(self.device)
        
        print("AI 모델 로딩 완료.")

    def analyze_image_to_keywords(self, image_path: Path) -> Dict:
        if not self.initialized: return {"error": "Model not initialized"}
        
        img = Image.open(image_path).convert("RGB")
        
        # 이미지 분석을 위해 텐서를 CPU로 보냅니다.
        img_tensor = self.places_transform(img).unsqueeze(0).to(self.device)
        
        # YOLO 예측
        yolo_results = self.yolo_model.predict(img, verbose=False)[0]
        yolo_objects = list(set([yolo_results.names[int(c)] for c in yolo_results.boxes.cls]))
        
        # Places365 예측
        with torch.no_grad():
            output = self.places_model(img_tensor)
        _, pred = output.topk(1, 1, True, True)
        place_type = self.places_categories[pred[0][0]]
        
        # BLIP 예측
        inputs = self.blip_processor(images=img, return_tensors="pt").to(self.device)
        out = self.blip_model.generate(**inputs, max_new_tokens=20)
        caption = self.blip_processor.decode(out[0], skip_special_tokens=True)
        
        blip_keywords = [word for word in re.split(r'\W+', caption.lower()) if len(word) > 2 and word not in ['the', 'and', 'with', 'are']]
        return { "yolo_objects": yolo_objects[:3], "place_type": [place_type], "blip_keywords": list(set(blip_keywords))[:5] }


    def generate_korean_text_from_keywords(self, prompt: str) -> str:
        if not self.initialized: return "모델이 초기화되지 않았습니다."
        
        messages = [{"role": "user", "content": prompt}]
        input_ids = self.exaone_tokenizer.apply_chat_template(
            messages,
            tokenize=True,
            add_generation_prompt=True,
            return_tensors="pt"
        ).to(self.device) # 👈 [수정 5] 생성된 텐서를 CPU로 이동
        
        output = self.exaone_model.generate(
            input_ids,
            max_new_tokens=150,
            do_sample=True,
            temperature=0.7
        )
        
        response_text = self.exaone_tokenizer.decode(output[0][input_ids.shape[1]:], skip_special_tokens=True)
        return response_text

# 싱글톤 인스턴스를 생성하여 다른 파일에서 'ai_models'를 import할 수 있도록 합니다.
ai_models = AIModelService()