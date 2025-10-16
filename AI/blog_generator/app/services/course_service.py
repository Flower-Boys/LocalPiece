import sqlite3
from app.models import CourseRequest, CourseResponse, DailyCourse, Place
from datetime import datetime, timedelta

# 데이터베이스 경로 (실제 환경에 맞게 조정 필요)
DB_PATH = "data/gyeongsangbuk_do.db"

class CourseService:
    def __init__(self):
        # DB에 한번만 연결합니다.
        self.conn = sqlite3.connect(DB_PATH)
        self.conn.row_factory = sqlite3.Row # 컬럼 이름으로 접근 가능하게 설정

    def generate_course(self, request: CourseRequest) -> CourseResponse:
        """
        요청에 따라 여행 코스를 생성하는 메인 메서드
        """
        print(f"코스 생성 요청 접수: {request.cities} 도시, 키워드: {request.keywords}")

        # TODO: 1. DB에서 후보 여행지 목록 가져오기
        # TODO: 2. 각 여행지별 '매력 점수' 계산하기
        # TODO: 3. 여행 기간 및 속도에 맞춰 일차별 코스 생성하기 (스케줄링 및 경로 최적화)
        # TODO: 4. 식사 및 숙소 자동 배치하기

        # --- 아래는 최종 결과물의 예시(더미 데이터)입니다. ---
        # 실제 로직 구현 후 이 부분을 동적으로 생성된 데이터로 교체해야 합니다.

        start_date = datetime.strptime(request.start_date, "%Y-%m-%d")
        end_date = datetime.strptime(request.end_date, "%Y-%m-%d")
        duration = (end_date - start_date).days + 1

        days_list = []
        for i in range(duration):
            current_date = start_date + timedelta(days=i)
            day_course = DailyCourse(
                day=i + 1,
                date=current_date.strftime("%Y-%m-%d"),
                route=[
                    Place(order=1, type="spot", name=f"{i+1}일차 첫번째 여행지", category="역사유적", address="경주시", arrival_time="10:00", departure_time="11:30", duration_minutes=90),
                    Place(order=2, type="meal", name="점심식사 장소", category="한식", address="경주시", arrival_time="12:00", departure_time="13:00", duration_minutes=60),
                    Place(order=3, type="spot", name=f"{i+1}일차 두번째 여행지", category="자연", address="경주시", arrival_time="13:30", departure_time="15:00", duration_minutes=90),
                ]
            )
            days_list.append(day_course)


        response = CourseResponse(
            trip_title=f"{', '.join(map(str, request.cities))}에서 즐기는 {duration-1}박 {duration}일 여행",
            days=days_list
        )

        return response

    def __del__(self):
        # 객체가 소멸될 때 DB 연결을 닫습니다.
        if self.conn:
            self.conn.close()

# 서비스 객체를 싱글턴처럼 사용하기 위해 인스턴스화
course_service = CourseService()