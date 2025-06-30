## 🏗️ 프로젝트 구조 소개 (백엔드)
### 📦 프로젝트 정보
- 프로젝트명: localpiece

- 그룹: com.flowerguys

- 패키지: com.flowerguys.localpiece

- 언어: Java 21

- 빌드 도구: Gradle (Groovy)

- 스프링 부트 버전: 3.3.13

- 패키징 방식: JAR

### 📚 주요 의존성
- Spring Web: REST API 구성

- Spring Security: 인증/인가 처리

- Spring Data JPA: DB 접근

- Lombok: 보일러플레이트 코드 최소화

- DevTools: 개발 편의 기능 제공

## 🧱 아키텍처
### 🎯 설계 방식: 도메인 주도 설계 (DDD)
전체 시스템의 볼륨이 크고, 도메인 단위로 직관적인 구조 파악이 가능하다고 판단하여 DDD를 채택했습니다.

## 📁 기본 패키지 구조
```
com.flowerguys.localpiece
├── global             # 전역 설정 (config, exception, security 등)
├── user               # 사용자 도메인
│   ├── controller
│   ├── service
│   ├── entity
│   ├── repository
│   └── dto
├── post               # 게시물 도메인
│   └── ...
├── comment            # 댓글 도메인
│   └── ...
└── ...
```
**각 도메인은 도메인 단위 폴더로 분리되어 관리되며, 내부에 관련된 클래스들이 독립적으로 구성됩니다.**

**전역 설정 및 공통 모듈은 global/ 디렉토리에 위치합니다.**

## 📌 선택 이유
"단순한 계층형 구조로는 관리가 어려운 규모이며, 도메인 중심으로 모듈화하면 유지보수성과 이해도가 높아진다"는 판단으로 도메인 주도 아키텍처(DDD) 방식을 선택하였습니다.

