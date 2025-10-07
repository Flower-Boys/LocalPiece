# 베이스 이미지는 Python 3.11-slim을 사용합니다.
FROM python:3.11-slim

RUN apt-get update && apt-get install -y libgl1-mesa-glx

# 작업 디렉터리를 설정합니다.
WORKDIR /ai_app

# 의존성 파일을 먼저 복사하여 설치합니다.
COPY ./blog_generator/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 나머지 소스 코드 전체를 작업 디렉터리로 복사합니다.
COPY ./blog_generator/ .

# FastAPI 앱이 실행될 포트를 노출합니다.
EXPOSE 8000
