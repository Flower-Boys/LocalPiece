from pydantic import BaseModel, Field
from typing import List, Dict, Optional
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
    
# --- 여행 코스 생성 모델 ---

class CourseRequest(BaseModel):
    """여행 코스 생성 요청 모델"""
    cities: List[int] = Field(..., description="도시 ID 리스트 (city_county_id)", example=[1, 5])
    start_date: str = Field(..., description="여행 시작일", example="2025-10-26")
    end_date: str = Field(..., description="여행 종료일", example="2025-10-27")
    keywords: List[str] = Field(..., description="여행 키워드 (대분류)", example=["자연", "맛집"])
    companions: str = Field(..., description="여행 멤버", example="커플/친구")
    pacing: str = Field(..., description="여행 속도", example="보통")
    must_visit_spots: Optional[List[int]] = Field(None, description="꼭 방문하고 싶은 장소 ID 리스트 (content_id)", example=[12345, 67890])

class Place(BaseModel):
    """코스에 포함된 장소 모델"""
    order: int
    content_id: int
    type: str
    name: str
    category: Optional[str] = None
    address: Optional[str] = None
    arrival_time: str
    departure_time: str
    duration_minutes: int

class DailyCourse(BaseModel):
    """일차별 코스 모델"""
    day: int
    date: str
    route: List[Place]

class CourseResponse(BaseModel):
    """여행 코스 생성 응답 모델"""
    trip_title: str
    days: List[DailyCourse]

class CourseOption(BaseModel):
    """하나의 추천 코스 대안 모델"""
    theme_title: str
    days: List[DailyCourse]

class CourseResponse(BaseModel):
    """여행 코스 생성 최종 응답 모델 (여러 대안 포함)"""
    trip_title: str
    courses: List[CourseOption]
    
class ReplacePlaceRequest(BaseModel):
    """장소 교체 요청 모델"""
    course_option: CourseOption = Field(..., description="현재 사용자가 보고 있는 코스 원본")
    day_number: int = Field(..., description="교체할 장소가 있는 날짜 (예: 1 for day 1)")
    place_order_to_replace: int = Field(..., description="교체될 장소의 순서 (order)")