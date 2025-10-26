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
    "맛집": ["restaurant", "한식", "서양식", "일식", "중식", "이색음식점"],
    "쇼핑": ["5일장", "상설시장", "백화점", "면세점", "대형마트", "전문매장/상가", "공예/공방", "특산물판매점"],
    "숙박": ["관광호텔", "콘도미니엄", "유스호스텔", "펜션", "모텔", "민박", "게스트하우스", "홈스테이", "서비스드레지던스", "한옥"]
}

CATEGORY_STAY_TIME = {
    "박물관": 120, "미술관/화랑": 120, "유적지/사적지": 90, "사찰": 70, "자연휴양림": 100, "해수욕장": 120, "테마공원": 150,
    "관광지": 90, "문화시설": 120, "행사/공연/축제": 120, "여행코스": 180, "레포츠": 150, "숙박": 0, "쇼핑": 90, "음식점": 70, "카페/전통찻집": 60, "역사": 90, "자연": 70, "체험": 120, "기타": 60, "기본": 90
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

    def _fetch_candidate_places(self, cities: List[int], keywords: List[str], must_visit_spots: List[int] = None) -> List[Dict[str, Any]]:
        cursor = self.conn.cursor()
        target_categories_list = []
        for keyword in keywords:
            target_categories_list.extend(KEYWORD_CATEGORY_MAP.get(keyword, []))
        
        target_categories_list.extend(KEYWORD_CATEGORY_MAP["맛집"])
        target_categories_list.extend(KEYWORD_CATEGORY_MAP["휴식/힐링"])
        target_categories_list.extend(KEYWORD_CATEGORY_MAP["숙박"])
        
        unique_target_categories = set(target_categories_list)
        placeholders = ','.join('?' for _ in unique_target_categories)
        city_placeholders = ','.join('?' for _ in cities)
        
        must_visit_placeholders = ""
        if must_visit_spots:
            must_visit_placeholders = f"OR t.content_id IN ({','.join('?' for _ in must_visit_spots)})"

        query = f"""
            SELECT
                t.tourism_id, t.content_id, t.title, t.addr1, t.lat, t.lon, t.city_county_id,
                c.name as category_name,
                IFNULL(r.avg_overall_rate, 3.0) as avg_rate,
                latest_rpl.rate as concentration_rate
            FROM tourism t
            LEFT JOIN category c ON t.category_id = c.category_id
            LEFT JOIN (SELECT tourism_id, AVG(overall_rate) as avg_overall_rate FROM review GROUP BY tourism_id) r ON t.tourism_id = r.tourism_id
            LEFT JOIN (SELECT title, rate FROM (SELECT title, rate, ROW_NUMBER() OVER(PARTITION BY title ORDER BY base_date DESC) as rn FROM rate_pre_list) WHERE rn = 1) latest_rpl ON t.title = latest_rpl.title
            WHERE 
              (t.city_county_id IN ({city_placeholders}) AND c.name IN ({placeholders}))
              {must_visit_placeholders}
              AND t.lat IS NOT NULL AND t.lon IS NOT NULL AND t.lat != 'None' AND t.lon != 'None';
        """
        params = tuple(cities) + tuple(unique_target_categories)
        if must_visit_spots:
            params += tuple(must_visit_spots)

        cursor.execute(query, params)
        candidates = [dict(row) for row in cursor.fetchall() if isinstance(row['lat'], (int, float)) and isinstance(row['lon'], (int, float))]
        print(f"총 {len(candidates)}개의 유효한 후보 장소를 찾았습니다.")
        return candidates

    def _calculate_scores(self, candidates: List[Dict[str, Any]], keywords: List[str], strategy: str = "default") -> List[Dict[str, Any]]:
        scored_places = []
        user_categories = set()
        for keyword in keywords: user_categories.update(KEYWORD_CATEGORY_MAP.get(keyword, []))
        for place in candidates:
            popularity_score = (place['avg_rate'] / 5.0) * 100
            concentration = place.get('concentration_rate'); rarity_score = 50 if concentration is None else (1 - (concentration / 100.0)) * 100
            personalization_score = 100 if place['category_name'] in user_categories else 50
            if strategy == "hidden_gem": score = (popularity_score * 0.3) + (rarity_score * 0.4) + (personalization_score * 0.3)
            else: score = (popularity_score * 0.5) + (rarity_score * 0.2) + (personalization_score * 0.3)
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
        end_date = datetime.strptime(request.end_date, "%Y-%m-%d")
        duration = (end_date - start_date).days + 1
        cities_per_day = request.cities * (duration // len(request.cities)) + request.cities[:duration % len(request.cities)]

        meal_categories = set(KEYWORD_CATEGORY_MAP["맛집"]); cafe_categories = {"카페/전통찻집"}
        spot_categories = set()
        for key, val in KEYWORD_CATEGORY_MAP.items():
            if key not in ["맛집", "휴식/힐링", "숙박"]: spot_categories.update(val)
        accommodation_pool = [p for p in scored_places if p['category_name'] in KEYWORD_CATEGORY_MAP["숙박"]]

        all_days_courses = []; visited_spot_ids = set(); last_accommodation = None
        must_visit_pool = {p['content_id']: p for p in scored_places if p['content_id'] in (request.must_visit_spots or [])}
        
        for i in range(duration):
            current_date = start_date + timedelta(days=i)
            daily_route_details = []
            
            current_city_id = cities_per_day[i]
            city_scored_places = [p for p in scored_places if p.get('city_county_id') == current_city_id]
            spot_pool = [p for p in city_scored_places if p['category_name'] in spot_categories]
            meal_pool = [p for p in city_scored_places if p['category_name'] in meal_categories]
            cafe_pool = [p for p in city_scored_places if p['category_name'] in cafe_categories]
            
            current_location, start_spot = None, None
            
            must_visit_for_today = next((p for p in must_visit_pool.values() if p.get('city_county_id') == current_city_id and p['content_id'] not in visited_spot_ids), None)

            if must_visit_for_today:
                start_spot = must_visit_for_today
            elif last_accommodation:
                start_spot = last_accommodation
            else:
                available_spots = [p for p in spot_pool if p['content_id'] not in visited_spot_ids and p['content_id'] not in must_visit_pool]
                effective_start_index = start_index % len(available_spots) if available_spots else 0
                if available_spots: start_spot = available_spots[effective_start_index]
                else: continue

            if not start_spot: continue

            current_location = start_spot
            current_time = datetime.combine(current_date, time(9, 0))
            end_of_day = datetime.combine(current_date, time(21, 0))

            start_spot_category = start_spot.get('category_name')

            if start_spot_category in KEYWORD_CATEGORY_MAP["숙박"]:
                # 2일차 이상: 시작점이 숙소인 경우
                # 출발 시간(9시)만 기록하고, 머무는 시간은 0으로 설정
                daily_route_details.append({
                    "details": start_spot,
                    "type": "accommodation",
                    "arrival_time": current_time,
                    "departure_time": current_time  # 출발 시간이 9시
                })
                # 숙소는 visited_spot_ids에 추가하지 않아도 됩니다. (숙소는 매일 방문 가능)
            else:
                # 1일차: 시작점이 관광지/맛집인 경우
                visited_spot_ids.add(start_spot['content_id'])
                start_spot_type = "meal" if start_spot_category in meal_categories else "spot"
                stay_time = CATEGORY_STAY_TIME.get(start_spot_category, 90)
                departure_time = current_time + timedelta(minutes=stay_time)
                daily_route_details.append({
                    "details": start_spot,
                    "type": start_spot_type,
                    "arrival_time": current_time,
                    "departure_time": departure_time
                })
                
            meal_times = {"lunch": (time(12, 0), time(13, 30)), "dinner": (time(18, 0), time(19, 30))}; added_meals, cafe_added = [], False
            if daily_route_details and daily_route_details[0]['type'] == "meal":
                if time(9,0) <= current_time.time() < time(15,0): added_meals.append("lunch")
                else: added_meals.append("dinner")

            while True:
                last_event_departure_time = daily_route_details[-1]['departure_time'] if daily_route_details else current_time
                if last_event_departure_time >= end_of_day: break
                
                last_event_type = daily_route_details[-1]['type'] if daily_route_details else None
                next_place, place_type = None, "spot"

                if last_event_type == "meal" and not cafe_added and "휴식/힐링" in request.keywords:
                    available_cafes = [p for p in cafe_pool if p['content_id'] not in visited_spot_ids]
                    if available_cafes: next_place, place_type, cafe_added = self._find_closest_place(current_location, available_cafes), "spot", True
                if not next_place:
                    next_meal_type = None
                    for meal, (start, end) in meal_times.items():
                        if start <= last_event_departure_time.time() < end and meal not in added_meals:
                            next_meal_type = meal; break
                    if next_meal_type:
                        available_meals = [p for p in meal_pool if p['content_id'] not in visited_spot_ids]
                        if available_meals: next_place, place_type = self._find_closest_place(current_location, available_meals), "meal"; added_meals.append(next_meal_type)
                if not next_place:
                    available_spots = [p for p in spot_pool if p['content_id'] not in visited_spot_ids]
                    if not available_spots: break
                    closest_spot = self._find_closest_place(current_location, available_spots)
                    if closest_spot: next_place, place_type = closest_spot, "spot"
                
                if not next_place: break
                
                visited_spot_ids.add(next_place['content_id'])
                travel_time = self._estimate_travel_time(self._haversine_distance(current_location['lat'], current_location['lon'], next_place['lat'], next_place['lon']))
                arrival = last_event_departure_time + timedelta(minutes=travel_time)
                stay = CATEGORY_STAY_TIME.get(next_place['category_name'], 70 if place_type == 'meal' else 90)
                departure = arrival + timedelta(minutes=stay)
                daily_route_details.append({"details": next_place, "type": place_type, "arrival_time": arrival, "departure_time": departure})
                current_location = next_place

            if duration > 1 and i < duration - 1:
                city_accommodations = [p for p in accommodation_pool if p.get('city_county_id') == current_city_id]
                if city_accommodations:
                    best_acco = sorted(city_accommodations, key=lambda x: x.get('score', 0), reverse=True)[0]
                    last_event_departure_time = daily_route_details[-1]['departure_time'] if daily_route_details else current_time
                    travel_time = self._estimate_travel_time(self._haversine_distance(current_location['lat'], current_location['lon'], best_acco['lat'], best_acco['lon']))
                    arrival = last_event_departure_time + timedelta(minutes=travel_time)
                    daily_route_details.append({"details": best_acco, "type": "accommodation", "arrival_time": arrival, "departure_time": arrival})
                    last_accommodation = best_acco
            
            final_route = [Place(
                order=idx + 1, content_id=item['details']['content_id'], type=item['type'], name=item['details']['title'],
                category=item['details']['category_name'], address=item['details']['addr1'],
                arrival_time=item['arrival_time'].strftime("%H:%M"), departure_time=item['departure_time'].strftime("%H:%M"),
                duration_minutes=int((item['departure_time'] - item['arrival_time']).total_seconds() / 60)
            ) for idx, item in enumerate(daily_route_details)]
            all_days_courses.append(DailyCourse(day=i+1, date=current_date.strftime("%Y-%m-%d"), route=final_route))
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
        
        # 1. 현재 경로의 모든 장소에 대한 상세 정보(tourism_id, city_county_id 포함)를 먼저 조회합니다.
        current_place_content_ids = tuple(p.content_id for p in original_route)
        id_placeholders = ','.join('?' for _ in current_place_content_ids) if current_place_content_ids else 'NULL'
        
        cursor.execute(
            f"""
            SELECT tourism_id, content_id, title, addr1, lat, lon, city_county_id, 
                   (SELECT name FROM category WHERE category_id = t.category_id) as category_name 
            FROM tourism t 
            WHERE content_id IN ({id_placeholders})
            """,
            current_place_content_ids
        )
        # DB 조회 결과를 content_id를 키로 하는 딕셔너리로 만듭니다.
        route_details_map = {int(row['content_id']): dict(row) for row in cursor.fetchall()}

        # 2. [핵심 수정] 교체할 장소의 상세 정보를 가져오고, 없으면 다른 장소에서 유추합니다.
        place_to_replace_details = route_details_map.get(place_to_replace.content_id)
        city_id_to_search = None

        if place_to_replace_details:
            city_id_to_search = place_to_replace_details['city_county_id']
        # DB에 교체할 장소 정보가 없더라도, 경로의 다른 장소 정보를 통해 도시 ID를 유추하여 로직을 계속 진행합니다.
        elif route_details_map:
            first_place_details = next(iter(route_details_map.values()))
            city_id_to_search = first_place_details['city_county_id']
            # 교체할 장소의 좌표는 없으므로, 도시의 첫 번째 장소 좌표를 기준점으로 임시 사용합니다.
            place_to_replace_details = first_place_details 
        else:
            # 경로에 유효한 장소가 하나도 없으면 교체가 불가능합니다.
            return None

        # 3. 쿼리에서 제외할 목록은 tourism_id로 생성합니다.
        current_place_tourism_ids = tuple(details['tourism_id'] for details in route_details_map.values())
        tourism_id_placeholders = ','.join('?' for _ in current_place_tourism_ids) if current_place_tourism_ids else 'NULL'
        
        candidates = []
        
        # 4-1단계: 동일 카테고리에서 탐색
        if place_to_replace.category:
            query = f"""
                SELECT t.tourism_id, t.content_id, t.title, t.addr1, t.lat, t.lon, c.name as category_name, IFNULL(r.avg_overall_rate, 3.0) as avg_rate 
                FROM tourism t 
                LEFT JOIN category c ON t.category_id = c.category_id 
                LEFT JOIN (SELECT tourism_id, AVG(overall_rate) as avg_overall_rate FROM review GROUP BY tourism_id) r ON t.tourism_id = r.tourism_id 
                WHERE c.name = ? AND t.city_county_id = ? AND t.tourism_id NOT IN ({tourism_id_placeholders}) 
                ORDER BY avg_rate DESC LIMIT 20;
            """
            params = (place_to_replace.category, city_id_to_search) + current_place_tourism_ids
            cursor.execute(query, params)
            candidates = [dict(row) for row in cursor.fetchall()]

        # 4-2단계: 상위 키워드로 확장 탐색
        if not candidates and place_to_replace.category:
            parent_keyword = next((key for key, values in KEYWORD_CATEGORY_MAP.items() if place_to_replace.category in values), None)
            if parent_keyword:
                broader_categories = KEYWORD_CATEGORY_MAP[parent_keyword]
                broader_placeholders = ','.join('?' for _ in broader_categories)
                query = f"""
                    SELECT t.tourism_id, t.content_id, t.title, t.addr1, t.lat, t.lon, c.name as category_name, IFNULL(r.avg_overall_rate, 3.0) as avg_rate 
                    FROM tourism t LEFT JOIN category c ON t.category_id = c.category_id 
                    LEFT JOIN (SELECT tourism_id, AVG(overall_rate) as avg_overall_rate FROM review GROUP BY tourism_id) r ON t.tourism_id = r.tourism_id 
                    WHERE c.name IN ({broader_placeholders}) AND t.city_county_id = ? AND t.tourism_id NOT IN ({tourism_id_placeholders}) 
                    ORDER BY avg_rate DESC LIMIT 20;
                """
                params = tuple(broader_categories) + (city_id_to_search,) + current_place_tourism_ids
                cursor.execute(query, params)
                candidates = [dict(row) for row in cursor.fetchall()]

        # 4-3단계: 타입 기반으로 최후 탐색
        if not candidates:
            search_categories = []
            if place_to_replace.type == 'meal': search_categories = KEYWORD_CATEGORY_MAP.get("맛집", [])
            elif place_to_replace.type == 'spot':
                search_categories = [cat for key, values in KEYWORD_CATEGORY_MAP.items() if key not in ["맛집", "숙박"] for cat in values]
            
            if search_categories:
                search_placeholders = ','.join('?' for _ in set(search_categories))
                query = f"""
                    SELECT t.tourism_id, t.content_id, t.title, t.addr1, t.lat, t.lon, c.name as category_name, IFNULL(r.avg_overall_rate, 3.0) as avg_rate 
                    FROM tourism t LEFT JOIN category c ON t.category_id = c.category_id 
                    LEFT JOIN (SELECT tourism_id, AVG(overall_rate) as avg_overall_rate FROM review GROUP BY tourism_id) r ON t.tourism_id = r.tourism_id 
                    WHERE c.name IN ({search_placeholders}) AND t.city_county_id = ? AND t.tourism_id NOT IN ({tourism_id_placeholders}) 
                    ORDER BY avg_rate DESC LIMIT 20;
                """
                params = tuple(set(search_categories)) + (city_id_to_search,) + current_place_tourism_ids
                cursor.execute(query, params)
                candidates = [dict(row) for row in cursor.fetchall()]

        if not candidates: return None
        best_replacement = self._find_closest_place(place_to_replace_details, candidates)
        if not best_replacement: return None
        
        # 5. 동선 재계산 (기존 로직과 동일)
        new_route = original_route[:order_to_replace - 1]
        last_departure_time_str = "09:00" if order_to_replace == 1 else new_route[-1].departure_time
        last_departure_time = datetime.strptime(last_departure_time_str, "%H:%M")
        prev_location_details = route_details_map.get(new_route[-1].content_id) if order_to_replace > 1 else place_to_replace_details
        travel_time = self._estimate_travel_time(self._haversine_distance(prev_location_details['lat'], prev_location_details['lon'], best_replacement['lat'], best_replacement['lon']))
        arrival_time = last_departure_time + timedelta(minutes=travel_time)
        stay_time = CATEGORY_STAY_TIME.get(best_replacement['category_name'], 90)
        departure_time = arrival_time + timedelta(minutes=stay_time)

        new_route.append(Place(
            order=order_to_replace, content_id=best_replacement['content_id'], type=place_to_replace.type,
            name=best_replacement['title'], category=best_replacement['category_name'], address=best_replacement['addr1'],
            arrival_time=arrival_time.strftime("%H:%M"), departure_time=departure_time.strftime("%H:%M"),
            duration_minutes=int(stay_time)
        ))
        current_location_details = best_replacement
        last_departure_time = departure_time

        for i in range(order_to_replace, len(original_route)):
            next_place_in_route = original_route[i]
            next_place_details = route_details_map.get(next_place_in_route.content_id)
            if not next_place_details: continue
            travel_time = self._estimate_travel_time(self._haversine_distance(current_location_details['lat'], current_location_details['lon'], next_place_details['lat'], next_place_details['lon']))
            arrival_time = last_departure_time + timedelta(minutes=travel_time)
            stay_time = next_place_in_route.duration_minutes
            departure_time = arrival_time + timedelta(minutes=stay_time)
            new_route.append(Place(
                order=i + 1, content_id=next_place_details['content_id'], type=next_place_in_route.type,
                name=next_place_details['title'], category=next_place_details['category_name'], address=next_place_details['addr1'],
                arrival_time=arrival_time.strftime("%H:%M"), departure_time=departure_time.strftime("%H:%M"),
                duration_minutes=int(stay_time)
            ))
            current_location_details = next_place_details
            last_departure_time = departure_time
        
        course.days[day_index].route = new_route
        return course
    
    def generate_course(self, request: CourseRequest) -> CourseResponse:
        all_candidates = self._fetch_candidate_places(request.cities, request.keywords, request.must_visit_spots)
        if not all_candidates: return CourseResponse(trip_title="추천 코스를 찾을 수 없습니다.", courses=[])
        
        scored_places_default = self._calculate_scores(all_candidates, request.keywords, strategy="default")
        course_option_1_days = self._generate_single_course_option(request, scored_places_default, start_index=0)
        option1 = CourseOption(theme_title="👍 인기만점! 베스트 코스", days=course_option_1_days)
        
        course_option_2_days = self._generate_single_course_option(request, scored_places_default, start_index=1)
        option2 = CourseOption(theme_title="✨ 또 다른 매력! 추천 코스", days=course_option_2_days)
        
        scored_places_hidden = self._calculate_scores(all_candidates, request.keywords, strategy="hidden_gem")
        course_option_3_days = self._generate_single_course_option(request, scored_places_hidden, start_index=0)
        option3 = CourseOption(theme_title="🤫 나만 아는 숨은 명소 코스", days=course_option_3_days)
        
        duration = (datetime.strptime(request.end_date, "%Y-%m-%d") - datetime.strptime(request.start_date, "%Y-%m-%d")).days + 1
        
        valid_options = [opt for opt in [option1, option2, option3] if opt.days and all(day.route for day in opt.days)]

        return CourseResponse(
            trip_title=f"당신만을 위한 경상북도 {duration-1}박 {duration}일 추천 코스",
            courses=valid_options
        )

    def __del__(self):
        if self.conn:
            self.conn.close()

course_service = CourseService()