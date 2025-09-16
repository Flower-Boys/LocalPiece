from pydantic import BaseModel, Field
from typing import List
from dataclasses import dataclass, field

# --- API 통신 모델 ---
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
    id: int = Field(default=1)
    blog: List[BlogContent]
    comment: str

# --- 내부 데이터 처리 모델 ---
@dataclass
class AnalyzedPhoto:
    metadata: ImageMetadataDto
    yolo_objects: List[str] = field(default_factory=list)
    place_type: str = "어느 멋진 곳"
    caption: str = "특별한 순간을 담았어요."

@dataclass
class Chapter:
    photos: List[AnalyzedPhoto] = field(default_factory=list)
    place_name: str = "기억에 남는 장소"
    start_time: str | None = None
    end_time: str | None = None