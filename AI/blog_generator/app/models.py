from pydantic import BaseModel, Field
from typing import List, Dict
from dataclasses import dataclass, field

# --- API 통신 모델 --- (기존과 동일)
class ImageMetadataDto(BaseModel):
    url: str
    timestamp: str | None = None
    latitude: float | None = None
    longitude: float | None = None

class AiGenerationRequestDto(BaseModel):
    id: str
    images: List[ImageMetadataDto]
    city: str

class BlogContent(BaseModel):
    image: str
    text: str

class AiResponseDto(BaseModel):
    blog: List[BlogContent]
    comment: str

# --- 내부 데이터 처리 모델 ---
@dataclass
class AnalyzedPhoto:
    metadata: ImageMetadataDto
    
    # ✨ (수정) 카카오맵 API 결과를 저장할 변수 추가 ✨
    place_name: str | None = None 
    
    # ✨ (수정) AI 분석 결과를 저장할 analysis 딕셔너리 추가 ✨
    # yolo_objects, place_type 등을 여기에 모두 담아 한번에 전달합니다.
    analysis: Dict = field(default_factory=dict)

# Chapter 모델은 현재 파이프라인에서 사용하지 않으므로, 그대로 두거나 삭제하셔도 됩니다.
@dataclass
class Chapter:
    photos: List[AnalyzedPhoto] = field(default_factory=list)
    place_name: str = "기억에 남는 장소"
    start_time: str | None = None
    end_time: str | None = None