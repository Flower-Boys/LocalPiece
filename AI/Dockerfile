# 1. 베이스 이미지 선택 (안정적인 파이썬 3.9 버전을 사용합니다)
FROM python:3.9

# 2. 보안을 위해 루트가 아닌 일반 사용자를 생성하고 전환합니다.
RUN useradd -m -u 1000 user
USER user

# 3. pip 실행 파일 경로를 환경 변수에 추가합니다.
ENV PATH="/home/user/.local/bin:$PATH"

# 4. 작업 디렉토리를 생성하고 이동합니다.
WORKDIR /app

# 5. 의존성 파일을 먼저 복사합니다. (경로 수정!)
COPY --chown=user ./blog_generator/requirements.txt requirements.txt

# 6. 의존성을 설치합니다.
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# 7. 프로젝트의 모든 파일을 작업 디렉토리로 복사합니다.
COPY --chown=user . .

# 8. 서버를 실행합니다. Hugging Face가 요구하는 7860번 포트를 사용합니다.
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "7860"]