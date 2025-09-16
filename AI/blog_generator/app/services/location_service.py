# app/services/location_service.py
import requests
from haversine import haversine, Unit
from typing import List
from app.models import ImageMetadataDto, Chapter, AnalyzedPhoto
from app.config import CHAPTER_CLUSTER_DISTANCE_METERS, KAKAO_API_KEY, KAKAO_API_URL, VALID_PLACE_CATEGORIES

def _fetch_place_name_from_kakao(lat: float, lon: float) -> str | None:
    """카카오 API를 호출하여 좌표에 해당하는 장소 이름을 가져옵니다."""
    if not KAKAO_API_KEY:
        print("WARNING: .env 파일에 KAKAO_API_KEY가 설정되지 않았습니다.")
        return None
    try:
        headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
        params = {"x": lon, "y": lat}
        response = requests.get(KAKAO_API_URL, headers=headers, params=params, timeout=5)
        response.raise_for_status()
        data = response.json().get("documents", [])
        if not data:
            return None

        # 건물/상호 이름이 있는 도로명 주소를 최우선으로 사용
        road_info = data[0].get("road_address")
        if road_info and road_info.get("building_name") and road_info.get("category_group_code") in VALID_PLACE_CATEGORIES:
            return road_info["building_name"]
        
        # 없다면 지번 주소의 상호/건물 이름을 사용
        address_info = data[0].get("address")
        if address_info and address_info.get("category_group_code") in VALID_PLACE_CATEGORIES:
            return address_info["address_name"].split()[-1]
            
    except requests.exceptions.RequestException as e:
        print(f"ERROR: Kakao API 호출 실패: {e}")
    return None

def cluster_photos_into_chapters(photos: List[ImageMetadataDto]) -> List[Chapter]:
    """사진들을 GPS 기반으로 클러스터링하여 챕터 리스트를 생성합니다."""
    if not photos:
        return []

    chapters = []
    current_chapter_photos = [photos[0]]

    for i in range(1, len(photos)):
        prev = photos[i-1]
        curr = photos[i]

        # 두 사진 모두 GPS 정보가 있어야 거리 계산 가능
        if prev.latitude and prev.longitude and curr.latitude and curr.longitude:
            distance = haversine((prev.latitude, prev.longitude), (curr.latitude, curr.longitude), unit=Unit.METERS)
            # 설정된 거리 이내면 같은 챕터로 묶음
            if distance <= CHAPTER_CLUSTER_DISTANCE_METERS:
                current_chapter_photos.append(curr)
            # 거리가 멀면 새로운 챕터 시작
            else:
                chapters.append(Chapter(photos=[AnalyzedPhoto(metadata=p) for p in current_chapter_photos]))
                current_chapter_photos = [curr]
        else:
            # GPS 정보가 하나라도 없으면 강제로 챕터 분리
            chapters.append(Chapter(photos=[AnalyzedPhoto(metadata=p) for p in current_chapter_photos]))
            current_chapter_photos = [curr]

    chapters.append(Chapter(photos=[AnalyzedPhoto(metadata=p) for p in current_chapter_photos]))

    # 각 챕터의 장소 이름 결정 및 시간 정보 기록
    for chapter in chapters:
        middle_photo_meta = chapter.photos[len(chapter.photos) // 2].metadata
        if middle_photo_meta.latitude and middle_photo_meta.longitude:
            name = _fetch_place_name_from_kakao(middle_photo_meta.latitude, middle_photo_meta.longitude)
            if name:
                chapter.place_name = name
        
        chapter.start_time = chapter.photos[0].metadata.timestamp
        chapter.end_time = chapter.photos[-1].metadata.timestamp
        
    return chapters