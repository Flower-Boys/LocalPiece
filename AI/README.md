# 📘 AI Blog Generator - 프로젝트 설명서 (README)

본 프로젝트는 이미지를 기반으로 **장소/객체/상황을 자동 분석**하여,
**한글 감성 블로그 문장을 자동 생성**하는 AI 파이프라인입니다.

---

## 🧠 파이프라인 개요

1. **이미지 업로드**
2. **YOLOv8** → 객체 탐지 (ex. 사람, 강아지, 자전거 등)
3. **Places365** → 장소 분류 (ex. 해변, 찻집, 산책로 등)
4. **BLIP** → 이미지 캡셔닝 (상황 설명 문장 자동 생성)
5. **Keyword 통합 및 정제**
6. **Blog Generator** → 감성 문장으로 변환하여 블로그 본문 생성

> FastAPI 기반으로 엔드포인트를 열어 API 호출을 통해 블로그 문장을 생성할 수 있습니다.

---

## 🏗️ 폴더 구조

```
AI/
├── app/
│   ├── main.py              # FastAPI 서버 진입점
│   └── routers/
│       └── blog_router.py   # 블로그 생성 요청 핸들러
│
├── ai_modules/
│   ├── main_blip.py         # 핵심 분석 파이프라인 (YOLO, Places, BLIP)
│   └── places/
│       ├── resnet18_places365.pth.tar         # pretrained weight
│       └── categories_places365.txt           # 장소 클래스 리스트
│
├── blog_generator.py        # 블로그 문장 생성기
└── requirements.txt         # 전체 dependency 목록
```

---

## 🤖 사용한 AI 모델 및 역할

| 모델명                  | 역할                     | 라이브러리                                                   |
| -------------------- | ---------------------- | ------------------------------------------------------- |
| YOLOv8               | 객체 탐지 (사람, 강아지, 자전거 등) | `ultralytics`                                           |
| Places365 (ResNet18) | 장소 인식 (해변, 찻집 등)       | `torchvision.models`                                    |
| BLIP (base)          | 이미지 캡셔닝                | `transformers`, `Salesforce/blip-image-captioning-base` |

---

## 🧾 주요 라이브러리 목록

> 다음은 `requirements.txt` 또는 `pip freeze` 기준 설치된 패키지 목록입니다.

* torch==2.8.0
* torchvision==0.23.0
* transformers==4.56.1
* ultralytics==8.3.197
* huggingface-hub==0.34.4
* accelerate==1.10.1
* timm==1.0.19
* opencv-python==4.12.0.88
* polars==1.33.1
* matplotlib==3.10.6
* requests==2.32.5
* tqdm==4.67.1
* 기타: numpy, pillow, scipy, Jinja2, pyyaml 등 포함

---

## 🚀 실행 방법

### 1. 의존성 설치

```bash
pip install -r requirements.txt
```

### 2. FastAPI 실행

```bash
uvicorn app.main:app --host 0.0.0.0 --port 8000
```

### 3. API 호출 예시

```http
POST /generate-blog
Content-Type: multipart/form-data

- images: [파일1, 파일2, 파일3...]
- city: "제주도"
```

### 4. 응답 예시

```json
{
  "blog_text": "제주도에서 사람들과 함께한 따뜻한 하루...",
  "photos": [
    {
      "path": "sample.jpg",
      "yolo": ["사람", "강아지"],
      "places": ["해변", "산책로"],
      "caption": "a group of people walking on the beach"
    }
  ]
}
```

---

## 📌 특징

* ✅ 한국어 키워드 변환 포함 (예: person → 사람, coffee\_shop → 카페)
* ✅ 감성 문장 생성기 포함 (단순 나열 X, 상황에 맞는 블로그 스타일 문장)
* ✅ 모듈화된 구조 (YOLO, BLIP, Places 따로 관리)
* ✅ FastAPI 기반 API 호출 가능

---

## 📂 `places/categories_places365.txt` 파일 위치

> 반드시 아래 위치에 존재해야 합니다:

```
ai_modules/places/categories_places365.txt
```

> 모델 가중치 `resnet18_places365.pth.tar`도 같은 폴더에 위치해야 합니다.

---

## 💡 향후 확장 방향

* 한글 캡셔닝 모델로 교체 (ex. KoBLIP)
* 감정 분석 기반 맞춤 블로그 생성
* GPT 기반으로 스타일 다양화
* 장소/날씨/시간대 연동 자동 문장 생성

---

## 🙋‍♂️ 팀 소개

이 프로젝트는 LocalPiece 팀의 **AI 블로그 자동 생성 모듈**입니다.

* 사용 기술: Python, FastAPI, Huggingface Transformers, YOLO, TorchVision, Polars 등
