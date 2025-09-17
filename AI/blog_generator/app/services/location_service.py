import requests
from haversine import haversine, Unit
from typing import List
from app.models import ImageMetadataDto, Chapter, AnalyzedPhoto
from app.config import CHAPTER_CLUSTER_DISTANCE_METERS, KAKAO_API_KEY, KAKAO_API_URL

def _fetch_place_name_from_kakao(lat: float, lon: float) -> str | None:
    """카카오 API를 호출하여 좌표에 해당하는 장소 이름을 가져옵니다."""
    if not KAKAO_API_KEY:
        print("CRITICAL ERROR: .env 파일에 KAKAO_API_KEY가 설정되지 않았습니다.")
        return None
        
    try:
        headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
        params = {"x": lon, "y": lat}
        response = requests.get(KAKAO_API_URL, headers=headers, params=params, timeout=5)
        response.raise_for_status() 
        
        data = response.json().get("documents", [])
        if not data:
            return None

        # 1. '도로명 주소'에 '건물 이름'(building_name)이 있으면, 최우선으로 사용
        road_info = data[0].get("road_address")
        if road_info and road_info.get("building_name"):
            return road_info["building_name"]
            
    except requests.exceptions.HTTPError as http_err:
        print(f"CRITICAL ERROR: Kakao API 호출 실패! 응답 코드: {http_err.response.status_code}")
        if http_err.response.status_code == 401:
            print(" -> 401 Unauthorized: KAKAO_API_KEY가 정확한지, REST API 키가 맞는지 확인해주세요.")
            
    except requests.exceptions.RequestException as e:
        print(f"ERROR: 네트워크 연결 또는 타임아웃 문제일 수 있습니다: {e}")
        
    return None

# 이하 cluster_photos_into_chapters 함수는 이전 버전과 동일하게 유지합니다.
def cluster_photos_into_chapters(photos: List[ImageMetadataDto]) -> List[Chapter]:
    if not photos:
        return []

    chapters = []
    current_chapter_photos = [photos[0]]

    for i in range(1, len(photos)):
        prev = photos[i-1]
        curr = photos[i]

        if prev.latitude and prev.longitude and curr.latitude and curr.longitude:
            distance = haversine((prev.latitude, prev.longitude), (curr.latitude, curr.longitude), unit=Unit.METERS)
            if distance <= CHAPTER_CLUSTER_DISTANCE_METERS:
                current_chapter_photos.append(curr)
            else:
                chapters.append(Chapter(photos=[AnalyzedPhoto(metadata=p) for p in current_chapter_photos]))
                current_chapter_photos = [curr]
        else:
            chapters.append(Chapter(photos=[AnalyzedPhoto(metadata=p) for p in current_chapter_photos]))
            current_chapter_photos = [curr]

    chapters.append(Chapter(photos=[AnalyzedPhoto(metadata=p) for p in current_chapter_photos]))

    for chapter in chapters:
        middle_photo_meta = chapter.photos[len(chapter.photos) // 2].metadata
        if middle_photo_meta.latitude and middle_photo_meta.longitude:
            name = _fetch_place_name_from_kakao(middle_photo_meta.latitude, middle_photo_meta.longitude)
            if name:
                chapter.place_name = name
        
        chapter.start_time = chapter.photos[0].metadata.timestamp
        chapter.end_time = chapter.photos[-1].metadata.timestamp
        
    return chapters