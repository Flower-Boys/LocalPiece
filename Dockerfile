# 베이스 이미지로 Java 21 버전을 사용합니다.
FROM openjdk:21-jdk-slim

# 작업 디렉토리를 /app으로 설정합니다.
WORKDIR /app

# Gradle 빌드에 필요한 파일들을 먼저 복사하여 캐싱 효과를 극대화합니다.
COPY build.gradle settings.gradle /app/
COPY gradle /app/gradle

# 의존성을 먼저 다운로드합니다. 소스 코드가 변경되어도 이 부분은 재사용됩니다.
RUN ./gradlew build --no-daemon

# 소스 코드를 복사합니다.
COPY src /app/src

# 애플리케이션을 빌드합니다. (테스트는 CI 단계에서 하므로 생략)
RUN ./gradlew build --no-daemon -x test

# 빌드된 JAR 파일을 실행 가능한 위치로 복사합니다.
# build/libs/localpiece-0.0.1-SNAPSHOT.jar 와 같은 파일을 복사합니다.
COPY build/libs/*.jar app.jar

# 컨테이너가 시작될 때 실행될 명령어 (prod 프로파일 활성화)
ENTRYPOINT ["java", "-jar", "app.jar", "--spring.profiles.active=prod"]