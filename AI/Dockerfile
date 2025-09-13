# 1. 베이스 이미지를 파이썬 3.11 버전으로 선택합니다.
FROM python:3.11

# OpenCV(cv2) 실행에 필요한 시스템 라이브러리를 미리 설치합니다.
# apt-get update로 패키지 목록을 최신화하고, libgl1-mesa-glx를 설치합니다.
RUN apt-get update && apt-get install -y libgl1-mesa-glx

# 2. 보안을 위해 루트가 아닌 일반 사용자를 생성하고 전환합니다.
RUN useradd -m -u 1000 user
USER user

# 3. pip 실행 파일 경로를 환경 변수에 추가합니다.
ENV PATH="/home/user/.local/bin:$PATH"

# 4. 전체 프로젝트를 복사할 기본 작업 디렉토리를 생성합니다.
WORKDIR /app

# 5. 로컬의 모든 파일을 Docker 이미지 안으로 복사합니다.
# 이제 Docker 이미지 안에는 /app/blog_generator/app/main.py 와 같은 구조가 됩니다.
COPY --chown=user . .

# 6. 실제 파이썬 프로젝트가 있는 폴더로 작업 디렉토리를 변경합니다.
WORKDIR /app/blog_generator

# 7. 의존성을 설치합니다. (이제 requirements.txt를 바로 찾을 수 있습니다.)
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 8. 서버를 실행합니다. (이제 app/main.py를 바로 찾을 수 있습니다.)
CMD ["uvicorn", "app.main:app", "--host", "0.S0.0.0", "--port", "7860"]