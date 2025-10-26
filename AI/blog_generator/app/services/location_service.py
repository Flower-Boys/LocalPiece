import requests
from haversine import haversine, Unit
from typing import List
from app.models import ImageMetadataDto, Chapter, AnalyzedPhoto
from app.config import CHAPTER_CLUSTER_DISTANCE_METERS, KAKAO_API_KEY, KAKAO_API_URL

KAKAO_COORD_TO_ADDR_URL = "https://dapi.kakao.com/v2/local/geo/coord2address.json"
KAKAO_KEYWORD_SEARCH_URL = "https://dapi.kakao.com/v2/local/search/keyword.json"

PRIORITY_CATEGORIES = [
    "AT4",          # 1순위: 관광명소
    "CT1",          # 2순위: 문화시설
    "FD6",          # 3순위: 음식점
    "CE7",          # 3순위: 카페
    "AD5"           # 3순위: 숙박
]

def _fetch_place_name_from_kakao(lat: float, lon: float) -> str | None:
    """
    카카오 API를 사용하여 좌표에 해당하는 장소 이름을 가져옵니다.
    건물명을 최우선으로 하고, 없을 경우 서비스 맞춤 카테고리 순으로 검색합니다.
    """
    if not KAKAO_API_KEY:
        print("CRITICAL ERROR: .env 파일에 KAKAO_API_KEY가 설정되지 않았습니다.")
        return None
        
    headers = {"Authorization": f"KakaoAK {KAKAO_API_KEY}"}
    
    try:
        # --- 1단계: 좌표 -> 주소 변환 (역지오코딩) ---
        params_addr = {"x": lon, "y": lat}
        response_addr = requests.get(KAKAO_COORD_TO_ADDR_URL, headers=headers, params=params_addr, timeout=5)
        response_addr.raise_for_status()
        
        addr_data = response_addr.json().get("documents", [])
        if not addr_data:
            print("INFO: 1단계 역지오코딩 결과, 주소 정보를 찾을 수 없습니다.")
            return None

        address_info = addr_data[0]
        road_addr = address_info.get("road_address")

        # --- [최우선 로직] 1단계 결과에 '건물명'이 있는지 확인 ---
        if road_addr and road_addr.get("building_name"):
            print(f"INFO: 최우선 결과인 '건물명'({road_addr['building_name']})을 반환합니다.")
            return road_addr["building_name"]
            
        # --- '건물명'이 없을 경우, 2단계 키워드 검색을 위한 주소 추출 ---
        jibun_addr = address_info.get("address")
        search_keyword = ""
        if road_addr and road_addr.get("address_name"):
            search_keyword = road_addr["address_name"]
        elif jibun_addr and jibun_addr.get("address_name"):
            search_keyword = jibun_addr["address_name"]
        else:
            print("INFO: 2단계 검색에 사용할 유효한 주소명을 찾지 못했습니다.")
            return None
            
        # --- [핵심 로직] 우선순위 카테고리 순으로 순차적 검색 실행 ---
        print(f"INFO: '{search_keyword}' 주소로 우선순위 카테고리 검색을 시작합니다.")
        for category_code in PRIORITY_CATEGORIES:
            params_keyword = {
                "query": search_keyword,
                "x": lon,
                "y": lat,
                "size": 1,
                "category_group_code": category_code
            }
            response_keyword = requests.get(KAKAO_KEYWORD_SEARCH_URL, headers=headers, params=params_keyword, timeout=5)
            response_keyword.raise_for_status()

            keyword_data = response_keyword.json().get("documents", [])
            if keyword_data:
                place_name = keyword_data[0].get("place_name")
                print(f"✅ SUCCESS: 우선순위 카테고리 '{category_code}'에서 '{place_name}'을 찾았습니다.")
                return place_name # 결과를 찾았으므로 즉시 반환하고 종료
        
        # ✅ 3순위 (Fallback): 모든 카테고리 검색 실패 시, 필터 없이 일반 검색
        print(f"INFO: 2순위 검색 실패. 3순위(Fallback) 일반 검색을 시작합니다.")
        params_fallback = {"query": search_keyword, "x": lon, "y": lat, "size": 1}
        response_fallback = requests.get(KAKAO_KEYWORD_SEARCH_URL, headers=headers, params=params_fallback, timeout=5)
        response_fallback.raise_for_status()
        
        fallback_data = response_fallback.json().get("documents", [])
        if fallback_data:
            place_name = fallback_data[0].get("place_name")
            print(f"✅ SUCCESS: 3순위(Fallback) 검색에서 '{place_name}'을 찾았습니다.")
            return place_name

        print(f"❌ FAILED: 모든 검색 단계에서 장소를 찾지 못했습니다.")

    except requests.exceptions.HTTPError as http_err:
        print(f"CRITICAL ERROR: Kakao API 호출 실패! 응답 코드: {http_err.response.status_code}")
        if http_err.response.status_code == 401:
            print(" -> 401 Unauthorized: KAKAO_API_KEY가 정확한지 확인해주세요.")
            
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