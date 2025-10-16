import sqlite3
from app.models import CourseRequest, CourseResponse, DailyCourse, Place
from datetime import datetime, timedelta
from typing import List, Dict, Any
import math

# --- 상수 정의 ---
DB_PATH = "data/gyeongsangbuk_do.db"
AVG_SPEED_KMH = 40 # 자동차 평균 속도 (도심 및 관광지 이동 고려)

# 대분류 키워드 -> 세부 카테고리 매핑
KEYWORD_CATEGORY_MAP = {
    "자연": ["자연", "공원", "수목원", "휴양림", "산", "바다"],
    "역사/문화": ["역사", "문화시설", "사찰", "고택", "유적지", "박물관", "전시관"],
    "휴식/힐링": ["카페", "온천", "공원"],
    "액티비티/체험": ["체험", "레포츠", "테마파크"],
    "맛집": ["음식점"]
}

# 카테고리별 예상 체류 시간 (분)
CATEGORY_STAY_TIME = {
    "관광지": 90, "문화시설": 120, "행사/공연/축제": 120,
    "여행코스": 180, "레포츠": 150, "숙박": 60,
    "쇼핑": 90, "음식점": 70, "카페": 60,
    "역사": 90, "자연": 70, "체험": 120,
    "기타": 60, "기본": 90 # 카테고리 없는 경우
}

class CourseService:
    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        """두 지점 간의 직선 거리(km)를 계산 (Haversine formula)"""
        R = 6371  # 지구 반지름 (km)
        dLat = math.radians(lat2 - lat1)
        dLon = math.radians(lon2 - lon1)
        a = math.sin(dLat / 2) * math.sin(dLat / 2) + \
            math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * \
            math.sin(dLon / 2) * math.sin(dLon / 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def _estimate_travel_time(self, distance_km):
        """거리(km)를 기반으로 예상 이동 시간(분)을 계산"""
        return (distance_km / AVG_SPEED_KMH) * 60

    def _fetch_candidate_places(self, request: CourseRequest) -> List[Dict[str, Any]]:
        """DB에서 후보 여행지 목록을 가져오는 메서드"""
        cursor = self.conn.cursor()

        # 1. 사용자가 선택한 키워드에 해당하는 모든 세부 카테고리 가져오기
        target_categories = []
        for keyword in request.keywords:
            target_categories.extend(KEYWORD_CATEGORY_MAP.get(keyword, []))
        
        # 맛집/숙소는 기본적으로 포함
        target_categories.extend(["음식점", "숙박"])
        
        placeholders = ','.join('?' for _ in target_categories)
        city_placeholders = ','.join('?' for _ in request.cities)

        # 2. SQL 쿼리 작성 (JOIN을 통해 필요한 모든 정보 한번에 가져오기)
        query = f"""
            SELECT
                t.tourism_id, t.title, t.addr1, t.lat, t.lon,
                c.name as category_name,
                IFNULL(r.avg_rate, 3.0) as avg_rate, -- 리뷰 없으면 기본 3.0점
                rp.rate as concentration_rate
            FROM tourism t
            LEFT JOIN category c ON t.category_id = c.category_id
            LEFT JOIN (
                SELECT tourism_id, AVG(overall_rate) as avg_rate
                FROM review
                GROUP BY tourism_id
            ) r ON t.tourism_id = r.tourism_id
            LEFT JOIN rate_pre_list rp ON t.city_county_id = rp.city_county_id
            WHERE t.city_county_id IN ({city_placeholders})
              AND c.name IN ({placeholders})
              AND t.lat IS NOT NULL AND t.lon IS NOT NULL;
        """

        params = tuple(request.cities) + tuple(set(target_categories))
        cursor.execute(query, params)
        candidates = [dict(row) for row in cursor.fetchall()]
        print(f"총 {len(candidates)}개의 후보 장소를 찾았습니다.")
        return candidates

    def _calculate_scores(self, candidates: List[Dict[str, Any]], request: CourseRequest) -> List[Dict[str, Any]]:
        """각 후보지에 대해 '매력 점수'를 계산"""
        scored_places = []
        
        # 사용자가 선택한 키워드에 해당하는 카테고리 그룹
        user_categories = set()
        for keyword in request.keywords:
            user_categories.update(KEYWORD_CATEGORY_MAP.get(keyword, []))

        for place in candidates:
            # 1. 인기 점수 (0~100)
            popularity_score = (place['avg_rate'] / 5.0) * 100

            # 2. 희소성 점수 (0~100) - 집중률이 낮을수록 높음
            concentration = place.get('concentration_rate') or 0.5 # 값이 없으면 중간값 0.5
            rarity_score = (1 - concentration) * 100

            # 3. 개인화 적합도 점수 (0 또는 100)
            personalization_score = 100 if place['category_name'] in user_categories else 0
            
            # 4. 최종 점수 (가중 평균)
            score = (popularity_score * 0.4) + \
                    (rarity_score * 0.3) + \
                    (personalization_score * 0.3)
            
            place['score'] = score
            scored_places.append(place)
        
        # 점수가 높은 순으로 정렬
        return sorted(scored_places, key=lambda x: x['score'], reverse=True)

    def generate_course(self, request: CourseRequest) -> CourseResponse:
        """여행 코스를 생성하는 메인 메서드"""
        
        # 1. DB에서 후보지 목록 가져오기
        candidates = self._fetch_candidate_places(request)
        if not candidates:
            return CourseResponse(trip_title="추천 코스를 찾을 수 없습니다.", days=[])

        # 2. 후보지 점수 계산
        scored_places = self._calculate_scores(candidates, request)

        # 3. 여행 기간 및 일정 생성
        start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
        end_date = datetime.strptime(request.end_date, "%Y-%m-%d")
        duration = (end_date - start_date).days + 1

        pacing_map = {"여유롭게": 3, "보통": 4, "알차게": 5}
        spots_per_day = pacing_map.get(request.pacing, 4)

        all_days_courses: List[DailyCourse] = []
        
        # 방문한 장소 ID를 추적
        visited_spot_ids = set(request.must_visit_spots or [])

        # 필수 방문 장소 정보 미리 찾아두기
        must_visit_spots_details = [p for p in scored_places if p['tourism_id'] in visited_spot_ids]


        for i in range(duration):
            current_date = start_date + timedelta(days=i)
            daily_route_places: List[Dict[str, Any]] = []
            
            # 하루의 시작 시간 설정
            current_time = datetime.combine(current_date, datetime.strptime("09:00", "%H:%M").time())
            
            # 시작점 설정
            current_location = None
            if i == 0 : # 첫째날
                if must_visit_spots_details:
                    start_spot = must_visit_spots_details.pop(0)
                else:
                    # 관광지 중에서 점수 제일 높은 곳
                    start_spot = next((p for p in scored_places if p['category_name'] not in ['음식점', '숙박', '카페'] and p['tourism_id'] not in visited_spot_ids), None)
                
                if start_spot:
                    current_location = start_spot
                    daily_route_places.append(start_spot)
                    visited_spot_ids.add(start_spot['tourism_id'])

            else: # 둘째날 이후 (전날 숙소에서 시작해야 하지만, 숙소 정보가 없으므로 일단 첫째날과 동일하게 처리)
                 start_spot = next((p for p in scored_places if p['category_name'] not in ['음식점', '숙박', '카페'] and p['tourism_id'] not in visited_spot_ids), None)
                 if start_spot:
                    current_location = start_spot
                    daily_route_places.append(start_spot)
                    visited_spot_ids.add(start_spot['tourism_id'])


            # 하루 일정 채우기 (관광지 + 식사)
            meal_times = {"lunch": (12, 13.5), "dinner": (18, 19.5)} # 점심, 저녁 시간대
            added_meals = []

            while len(daily_route_places) < (spots_per_day + len(meal_times)):
                if not current_location: break
                
                # 식사 시간 체크
                next_meal = None
                time_of_day = current_time.hour + current_time.minute / 60.0
                
                for meal_type, (start, end) in meal_times.items():
                    if start <= time_of_day < end and meal_type not in added_meals:
                        next_meal = meal_type
                        break

                place_type_to_find = '음식점' if next_meal else '관광지'
                
                # 다음 장소 찾기 (가장 가까운 곳)
                next_place = None
                min_dist = float('inf')

                candidate_pool = []
                if place_type_to_find == '음식점':
                    candidate_pool = [p for p in scored_places if p['category_name'] == '음식점' and p['tourism_id'] not in visited_spot_ids]
                else:
                    candidate_pool = [p for p in scored_places if p['category_name'] not in ['음식점', '숙박', '카페'] and p['tourism_id'] not in visited_spot_ids]

                for candidate in candidate_pool:
                    dist = self._haversine_distance(current_location['lat'], current_location['lon'], candidate['lat'], candidate['lon'])
                    if dist < min_dist:
                        min_dist = dist
                        next_place = candidate
                
                if not next_place: break

                # 시간 업데이트 및 경로 추가
                travel_time = self._estimate_travel_time(min_dist)
                current_time += timedelta(minutes=travel_time)

                stay_time = CATEGORY_STAY_TIME.get(next_place['category_name'], 90)
                
                departure_time = current_time + timedelta(minutes=stay_time)

                # 최종 Place 모델에 맞게 데이터 추가
                place_info = {
                    "details": next_place,
                    "type": "meal" if place_type_to_find == '음식점' else "spot",
                    "arrival_time": current_time,
                    "departure_time": departure_time,
                    "duration_minutes": stay_time
                }
                daily_route_places.append(place_info)
                visited_spot_ids.add(next_place['tourism_id'])
                current_location = next_place
                current_time = departure_time

                if next_meal: added_meals.append(next_meal)


            # 최종 응답 모델에 맞게 변환
            final_route = []
            arrival = datetime.combine(current_date, datetime.strptime("09:00", "%H:%M").time())
            
            # 첫 장소는 이동시간 없음
            first_place_details = daily_route_places[0]
            stay_time = CATEGORY_STAY_TIME.get(first_place_details['category_name'], 90)
            departure = arrival + timedelta(minutes=stay_time)
            
            final_route.append(Place(
                order=1,
                type="spot",
                name=first_place_details['title'],
                category=first_place_details['category_name'],
                address=first_place_details['addr1'],
                arrival_time=arrival.strftime("%H:%M"),
                departure_time=departure.strftime("%H:%M"),
                duration_minutes=stay_time
            ))
            
            # 두번째 장소부터는 이동시간 계산
            for idx in range(1, len(daily_route_places)):
                prev_place_details = daily_route_places[idx-1]
                curr_place_details = daily_route_places[idx]['details']
                
                dist = self._haversine_distance(prev_place_details['lat'], prev_place_details['lon'], curr_place_details['lat'], curr_place_details['lon'])
                travel_time = self._estimate_travel_time(dist)
                
                arrival = datetime.strptime(final_route[-1].departure_time, "%H:%M") + timedelta(minutes=travel_time)
                stay_time = CATEGORY_STAY_TIME.get(curr_place_details['category_name'], 90)
                departure = arrival + timedelta(minutes=stay_time)

                final_route.append(Place(
                    order=idx + 1,
                    type=daily_route_places[idx]['type'],
                    name=curr_place_details['title'],
                    category=curr_place_details['category_name'],
                    address=curr_place_details['addr1'],
                    arrival_time=arrival.strftime("%H:%M"),
                    departure_time=departure.strftime("%H:%M"),
                    duration_minutes=stay_time
                ))


            all_days_courses.append(DailyCourse(day=i+1, date=current_date.strftime("%Y-%m-%d"), route=final_route))


        return CourseResponse(
            trip_title=f"당신만을 위한 경상북도 {duration-1}박 {duration}일 추천 코스",
            days=all_days_courses
        )

    def __del__(self):
        if self.conn:
            self.conn.close()

course_service = CourseService()