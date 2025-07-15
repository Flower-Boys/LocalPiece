# 베이스 이미지로 Java 21 ARM64 버전을 사용
FROM openjdk:21-jdk-slim

# 작업 디렉토리 설정
WORKDIR /app

# 빌드된 JAR 파일의 이름을 app.jar로 복사
COPY build/libs/app.jar app.jar

# 컨테이너 시작 시 JAR 파일 실행
ENTRYPOINT ["java","-jar","/app.jar", "--spring.profiles.active=prod"]