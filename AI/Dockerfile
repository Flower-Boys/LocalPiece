# 1. 베이스 이미지를 파이썬 3.11 버전으로 선택합니다.
FROM python:3.11

# 2. OpenCV(cv2) 실행에 필요한 시스템 라이브러리를 설치합니다.
# 최신 Debian 버전에 맞는 패키지 이름들입니다.
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3. 보안을 위해 루트가 아닌 일반 사용자를 생성하고 전환합니다.
RUN useradd -m -u 1000 user
USER user

# 4. pip 실행 파일 경로를 환경 변수에 추가합니다.
ENV PATH="/home/user/.local/bin:$PATH"

# 5. 전체 프로젝트를 복사할 기본 작업 디렉토리를 생성합니다.
WORKDIR /app

# 6. 로컬의 모든 파일을 Docker 이미지 안으로 복사합니다.
COPY --chown=user . .

# 7. 실제 파이썬 프로젝트가 있는 폴더로 작업 디렉토리를 변경합니다.
WORKDIR /app/blog_generator

# 8. 의존성을 설치합니다.
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 9. 서버를 실행합니다. Hugging Face가 요구하는 7860번 포트를 사용합니다.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]