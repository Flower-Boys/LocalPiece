# AI/blog_generator/app/services/course_service.py

import sqlite3
from app.models import CourseRequest, CourseResponse, DailyCourse, Place, CourseOption, ReplacePlaceRequest
from datetime import datetime, timedelta, time
from typing import List, Dict, Any
import math

# --- 상수 정의 ---
DB_PATH = "data/gyeongsangbuk_do.db"
AVG_SPEED_KMH = 40

KEYWORD_CATEGORY_MAP = {
    "자연": ["국립공원", "도립공원", "군립공원", "산", "자연생태관광지", "자연휴양림", "수목원", "폭포", "계곡", "약수터", "해안절경", "해수욕장", "섬", "항구/포구", "등대", "호수", "강", "동굴", "공원"],
    "역사/문화": ["박물관", "기념관", "전시관", "미술관/화랑", "공연장", "문화원", "도서관", "문화전수시설", "고궁", "성", "문", "고택", "생가", "민속마을", "유적지/사적지", "사찰", "종교성지", "안보관광"],
    "휴식/힐링": ["카페/전통찻집", "온천/욕장/스파", "이색찜질방", "공원", "자연휴양림", "수목원"],
    "액티비티/체험": ["수상레포츠", "항공레포츠", "수련시설", "경기장", "자전거하이킹", "카트", "골프", "승마", "스키/스노보드", "썰매장", "사격장", "야영장,오토캠핑장", "암벽등반", "서바이벌게임", "ATV", "MTB", "번지점프", "트래킹", "농.산.어촌 체험", "전통체험", "산사체험", "이색체험"],
    "맛집": ["restaurant", "한식", "서양식", "일식", "중식", "이색음식점", "카페/전통찻집"],
    "쇼핑": ["5일장", "상설시장", "백화점", "면세점", "대형마트", "전문매장/상가", "공예/공방", "특산물판매점"]
}

CATEGORY_STAY_TIME = {
    "박물관": 120, "미술관/화랑": 120, "유적지/사적지": 90, "사찰": 70, "자연휴양림": 100, "해수욕장": 120, "테마공원": 150,
    "관광지": 90, "문화시설": 120, "행사/공연/축제": 120, "여행코스": 180, "레포츠": 150, "숙박": 60, "쇼핑": 90, "음식점": 70, "카페/전통찻집": 60, "역사": 90, "자연": 70, "체험": 120, "기타": 60, "기본": 90
}

class CourseService:
    def __init__(self):
        self.conn = sqlite3.connect(DB_PATH, check_same_thread=False)
        self.conn.row_factory = sqlite3.Row

    def _haversine_distance(self, lat1, lon1, lat2, lon2):
        R = 6371
        if not all(isinstance(val, (int, float)) for val in [lat1, lon1, lat2, lon2]): return float('inf')
        dLat = math.radians(lat2 - lat1); dLon = math.radians(lon2 - lon1)
        a = math.sin(dLat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dLon / 2) ** 2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    def _estimate_travel_time(self, distance_km):
        return (distance_km / AVG_SPEED_KMH) * 60

    def _fetch_candidate_places(self, request: CourseRequest) -> List[Dict[str, Any]]:
        cursor = self.conn.cursor()
        target_categories_list = []
        for keyword in request.keywords:
            target_categories_list.extend(KEYWORD_CATEGORY_MAP.get(keyword, []))
        target_categories_list.extend(["한옥", "펜션", "모텔", "게스트하우스", "관광호텔", "콘도미니엄"])
        unique_target_categories = set(target_categories_list)
        placeholders, city_placeholders = ','.join('?' for _ in unique_target_categories), ','.join('?' for _ in request.cities)
        query = f"""
            SELECT t.tourism_id, t.title, t.addr1, t.lat, t.lon, c.name as category_name, IFNULL(r.avg_overall_rate, 3.0) as avg_rate, latest_rpl.rate as concentration_rate
            FROM tourism t
            LEFT JOIN category c ON t.category_id = c.category_id
            LEFT JOIN (SELECT tourism_id, AVG(overall_rate) as avg_overall_rate FROM review GROUP BY tourism_id) r ON t.tourism_id = r.tourism_id
            LEFT JOIN (SELECT title, rate FROM (SELECT title, rate, ROW_NUMBER() OVER(PARTITION BY title ORDER BY base_date DESC) as rn FROM rate_pre_list) WHERE rn = 1) latest_rpl ON t.title = latest_rpl.title
            WHERE t.city_county_id IN ({city_placeholders}) AND c.name IN ({placeholders}) AND t.lat IS NOT NULL AND t.lon IS NOT NULL AND t.lat != 'None' AND t.lon != 'None';
        """
        params = tuple(request.cities) + tuple(unique_target_categories)
        cursor.execute(query, params)
        candidates = [dict(row) for row in cursor.fetchall() if isinstance(row['lat'], (int, float)) and isinstance(row['lon'], (int, float))]
        print(f"총 {len(candidates)}개의 유효한 후보 장소를 찾았습니다.")
        return candidates

    def _calculate_scores(self, candidates: List[Dict[str, Any]], request: CourseRequest, strategy: str = "default") -> List[Dict[str, Any]]:
        scored_places = []
        user_categories = set()
        for keyword in request.keywords: user_categories.update(KEYWORD_CATEGORY_MAP.get(keyword, []))

        for place in candidates:
            popularity_score = (place['avg_rate'] / 5.0) * 100
            concentration = place.get('concentration_rate'); rarity_score = 50 if concentration is None else (1 - (concentration / 100.0)) * 100
            personalization_score = 100 if place['category_name'] in user_categories else 50
            if strategy == "hidden_gem":
                score = (popularity_score * 0.3) + (rarity_score * 0.4) + (personalization_score * 0.3)
            else:
                score = (popularity_score * 0.5) + (rarity_score * 0.2) + (personalization_score * 0.3)
            place['score'] = score
            scored_places.append(place)
        return sorted(scored_places, key=lambda x: x['score'], reverse=True)

    def _find_closest_place(self, from_location: Dict, pool: List[Dict]) -> Dict:
        closest_place, min_dist = None, float('inf')
        if not from_location: return None
        for candidate in pool:
            dist = self._haversine_distance(from_location['lat'], from_location['lon'], candidate['lat'], candidate['lon'])
            if dist < min_dist: min_dist, closest_place = dist, candidate
        return closest_place

    def _generate_single_course_option(self, request: CourseRequest, scored_places: List[Dict], start_index: int = 0) -> List[DailyCourse]:
        start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
        duration = (datetime.strptime(request.end_date, "%Y-%m-%d") - start_date).days + 1
        meal_categories = set(KEYWORD_CATEGORY_MAP["맛집"]); cafe_categories = {"카페/전통찻집"}
        spot_categories = set()
        for key, val in KEYWORD_CATEGORY_MAP.items():
            if key not in ["맛집", "휴식/힐링"]: spot_categories.update(val)
        spot_pool = [p for p in scored_places if p['category_name'] in spot_categories]
        meal_pool = [p for p in scored_places if p['category_name'] in meal_categories]
        cafe_pool = [p for p in scored_places if p['category_name'] in cafe_categories]
        all_days_courses = []
        for i in range(duration):
            visited_spot_ids = set(request.must_visit_spots or [])
            daily_route_details = []
            available_spots = [p for p in spot_pool if p['tourism_id'] not in visited_spot_ids]
            if start_index < len(available_spots): start_spot = available_spots[start_index]
            else: continue
            current_location = start_spot
            visited_spot_ids.add(start_spot['tourism_id'])
            current_time = datetime.combine(start_date + timedelta(days=i), time(9, 0))
            end_of_day = datetime.combine(start_date + timedelta(days=i), time(21, 0))
            stay_time = CATEGORY_STAY_TIME.get(start_spot['category_name'], 90)
            daily_route_details.append({"details": start_spot, "type": "spot", "arrival_time": current_time, "departure_time": current_time + timedelta(minutes=stay_time)})
            meal_times = {"lunch": (time(12, 0), time(13, 30)), "dinner": (time(18, 0), time(19, 30))}
            added_meals, cafe_added = [], False
            while True:
                last_event_departure_time = daily_route_details[-1]['departure_time']
                pacing_map = {"여유롭게": 3, "보통": 4, "알차게": 5}
                spots_per_day = pacing_map.get(request.pacing, 4)
                if last_event_departure_time >= end_of_day or len([p for p in daily_route_details if p['type'] == 'spot']) >= spots_per_day: break
                last_event_type = daily_route_details[-1]['type']
                next_place, place_type = None, "spot"
                if last_event_type == "meal" and not cafe_added and "휴식/힐링" in request.keywords:
                    available_cafes = [p for p in cafe_pool if p['tourism_id'] not in visited_spot_ids]
                    closest_cafe = self._find_closest_place(current_location, available_cafes)
                    if closest_cafe: next_place, place_type, cafe_added = closest_cafe, "spot", True
                if not next_place:
                    next_meal_type = None
                    for meal, (start, end) in meal_times.items():
                        if start <= last_event_departure_time.time() < end and meal not in added_meals:
                            next_meal_type = meal; break
                    if next_meal_type:
                        available_meals = [p for p in meal_pool if p['tourism_id'] not in visited_spot_ids]
                        closest_meal = self._find_closest_place(current_location, available_meals)
                        if closest_meal: next_place, place_type = closest_meal, "meal"; added_meals.append(next_meal_type)
                if not next_place:
                    available_spots = [p for p in spot_pool if p['tourism_id'] not in visited_spot_ids]
                    closest_spot = self._find_closest_place(current_location, available_spots)
                    if closest_spot: next_place, place_type = closest_spot, "spot"
                if not next_place: break
                visited_spot_ids.add(next_place['tourism_id'])
                travel_time = self._estimate_travel_time(self._haversine_distance(current_location['lat'], current_location['lon'], next_place['lat'], next_place['lon']))
                arrival = last_event_departure_time + timedelta(minutes=travel_time)
                stay = CATEGORY_STAY_TIME.get(next_place['category_name'], 70 if place_type == 'meal' else 90)
                departure = arrival + timedelta(minutes=stay)
                daily_route_details.append({"details": next_place, "type": place_type, "arrival_time": arrival, "departure_time": departure})
                current_location = next_place
            final_route = [Place(order=idx + 1, type=item['type'], name=item['details']['title'], category=item['details']['category_name'], address=item['details']['addr1'], arrival_time=item['arrival_time'].strftime("%H:%M"), departure_time=item['departure_time'].strftime("%H:%M"), duration_minutes=int((item['departure_time'] - item['arrival_time']).total_seconds() / 60)) for idx, item in enumerate(daily_route_details)]
            all_days_courses.append(DailyCourse(day=i+1, date=(start_date + timedelta(days=i)).strftime("%Y-%m-%d"), route=final_route))
        return all_days_courses

    def replace_place(self, request: ReplacePlaceRequest) -> CourseOption | None:
        course = request.course_option
        day_index = request.day_number - 1
        order_to_replace = request.place_order_to_replace

        if day_index >= len(course.days): return None
        original_route = course.days[day_index].route
        place_to_replace = next((p for p in original_route if p.order == order_to_replace), None)
        if not place_to_replace: return None

        cursor = self.conn.cursor()
        
        # ★★★★★ [핵심 수정] 쿼리에 addr1을 포함하여 모든 정보를 한번에 가져옵니다. ★★★★★
        current_place_names = tuple(p.name for p in original_route)
        name_placeholders = ','.join('?' for _ in current_place_names)
        cursor.execute(f"SELECT tourism_id, title, addr1, lat, lon, category_id, (SELECT name FROM category WHERE category_id = t.category_id) as category_name FROM tourism t WHERE title IN ({name_placeholders})", current_place_names)
        route_details_map = {dict(row)['title']: dict(row) for row in cursor.fetchall()}
        
        place_to_replace_details = route_details_map.get(place_to_replace.name)
        if not place_to_replace_details: return None
        existing_ids = set(v['tourism_id'] for v in route_details_map.values())

        candidate_query = f"""
            SELECT t.tourism_id, t.title, t.addr1, t.lat, t.lon, c.name as category_name, IFNULL(r.avg_overall_rate, 3.0) as avg_rate
            FROM tourism t
            LEFT JOIN category c ON t.category_id = c.category_id
            LEFT JOIN (SELECT tourism_id, AVG(overall_rate) as avg_overall_rate FROM review GROUP BY tourism_id) r ON t.tourism_id = r.tourism_id
            WHERE c.name = ? AND t.tourism_id NOT IN ({','.join('?'*len(existing_ids)) if existing_ids else 'NULL'})
            ORDER BY avg_rate DESC LIMIT 20;
        """
        params = (place_to_replace.category,) + tuple(existing_ids)
        cursor.execute(candidate_query, params)
        candidates = [dict(row) for row in cursor.fetchall()]
        if not candidates: return None

        best_replacement = self._find_closest_place(place_to_replace_details, candidates)
        if not best_replacement: return None

        new_route = []
        for i in range(order_to_replace - 1):
            new_route.append(original_route[i])

        last_departure_time_str = "09:00" if order_to_replace == 1 else new_route[-1].departure_time
        last_departure_time = datetime.strptime(last_departure_time_str, "%H:%M")
        
        prev_location_details = route_details_map.get(new_route[-1].name) if order_to_replace > 1 else {'lat': best_replacement['lat'], 'lon': best_replacement['lon']}
        
        travel_time = self._estimate_travel_time(self._haversine_distance(prev_location_details['lat'], prev_location_details['lon'], best_replacement['lat'], best_replacement['lon']))
        arrival_time = last_departure_time + timedelta(minutes=travel_time)
        stay_time = CATEGORY_STAY_TIME.get(best_replacement['category_name'], 90)
        departure_time = arrival_time + timedelta(minutes=stay_time)

        new_route.append(Place(
            order=order_to_replace, type=place_to_replace.type, name=best_replacement['title'],
            category=best_replacement['category_name'], address=best_replacement['addr1'],
            arrival_time=arrival_time.strftime("%H:%M"), departure_time=departure_time.strftime("%H:%M"),
            duration_minutes=stay_time
        ))

        current_location_details = best_replacement
        last_departure_time = departure_time

        for i in range(order_to_replace, len(original_route)):
            next_place_in_original_route = original_route[i]
            next_place_details = route_details_map.get(next_place_in_original_route.name)
            if not next_place_details: continue

            travel_time = self._estimate_travel_time(self._haversine_distance(current_location_details['lat'], current_location_details['lon'], next_place_details['lat'], next_place_details['lon']))
            arrival_time = last_departure_time + timedelta(minutes=travel_time)
            stay_time = CATEGORY_STAY_TIME.get(next_place_details['category_name'], 90)
            departure_time = arrival_time + timedelta(minutes=stay_time)
            
            new_route.append(Place(
                order=i + 1, type=next_place_in_original_route.type, name=next_place_details['title'],
                category=next_place_details['category_name'], address=next_place_details['addr1'],
                arrival_time=arrival_time.strftime("%H:%M"), departure_time=departure_time.strftime("%H:%M"),
                duration_minutes=stay_time
            ))
            current_location_details = next_place_details
            last_departure_time = departure_time
        
        course.days[day_index].route = new_route
        return course

    def generate_course(self, request: CourseRequest) -> CourseResponse:
        candidates = self._fetch_candidate_places(request)
        if not candidates: return CourseResponse(trip_title="추천 코스를 찾을 수 없습니다.", courses=[])
        scored_places_default = self._calculate_scores(candidates, request, strategy="default")
        course_option_1_days = self._generate_single_course_option(request, scored_places_default, start_index=0)
        option1 = CourseOption(theme_title="👍 인기만점! 베스트 코스", days=course_option_1_days)
        course_option_2_days = self._generate_single_course_option(request, scored_places_default, start_index=1)
        option2 = CourseOption(theme_title="✨ 또 다른 매력! 추천 코스", days=course_option_2_days)
        scored_places_hidden = self._calculate_scores(candidates, request, strategy="hidden_gem")
        course_option_3_days = self._generate_single_course_option(request, scored_places_hidden, start_index=0)
        option3 = CourseOption(theme_title="🤫 나만 아는 숨은 명소 코스", days=course_option_3_days)
        duration = (datetime.strptime(request.end_date, "%Y-%m-%d") - datetime.strptime(request.start_date, "%Y-%m-%d")).days + 1
        return CourseResponse(
            trip_title=f"당신만을 위한 경상북도 {duration-1}박 {duration}일 추천 코스",
            courses=[option1, option2, option3]
        )

    def __del__(self):
        if self.conn:
            self.conn.close()

course_service = CourseService()