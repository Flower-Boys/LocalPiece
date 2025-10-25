# 베이스 이미지로 Java 21 ARM64 버전을 사용
FROM openjdk:21-jdk-slim

# 패키지 목록 업데이트 및 curl 설치, 이후 불필요한 캐시 삭제
RUN apt-get update && apt-get install -y curl && rm -rf /var/lib/apt/lists/*

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일의 이름을 app.jar로 복사
COPY build/libs/app.jar app.jar

# 컨테이너 시작 시 JAR 파일 실행
ENTRYPOINT ["java","-jar","app.jar", "--spring.profiles.active=prod"]
