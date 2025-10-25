# 1. 베이스 이미지를 파이썬 3.11 버전으로 선택합니다.
FROM python:3.11

# 2. OpenCV(cv2) 실행에 필요한 시스템 라이브러리를 설치합니다.
RUN apt-get update && apt-get install -y \
    libgl1 \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# 3. 보안을 위해 루트가 아닌 일반 사용자를 생성합니다.
RUN useradd -m -u 1000 user
USER user

# 4. user의 개인 bin 폴더를 시스템 PATH에 추가합니다.
ENV PATH="/home/user/.local/bin:$PATH"

# 5. 작업 디렉토리를 생성하고 사용합니다.
WORKDIR /app

# 6. 필요한 파일만 복사합니다.
COPY --chown=user ./blog_generator/ .

# 7. 의존성을 설치합니다.
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 8. FastAPI 서버가 사용할 포트를 명시합니다.
EXPOSE 8000

# 9. 기본 실행 명령어를 정의합니다.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]