# 🧩 LocalPiece (로컬피스)

> **경상북도 공공데이터 기반 AI 여행 일정 자동 생성 & 블로그 자동 기록 플랫폼**

여행자는 단 몇 번의 클릭만으로,  
여행 루트 생성부터 블로그 기록까지 한 번에 자동으로 완성합니다.

---

## 🚀 주요 특징

- **경상북도 관광공사 공공데이터 기반** 여행지 정보 제공  
- **AI 일정 생성**: 여행 목적·분위기·동행자에 맞는 맞춤형 일정 자동 구성  
- **자동 블로그 기록**: 여행 후 방문지 기반으로 AI 블로그 자동 작성  
- **여행 조각(Piece) 시스템**: 여행지를 수집하며 “여행지도 퍼즐” 완성  
- **실시간 위치 지도 연동**: Google Maps API 기반 여행 동선 시각화  
- **반응형 UI**: 모바일/데스크톱 모두 자연스러운 화면 최적화  

---

## ⚙️ 기술 스택

| 구분 | 기술 |
|------|------|
| **프레임워크** | React 18 (Vite 기반 빌드) |
| **언어/타입 시스템** | TypeScript 5.8 |
| **스타일링** | TailwindCSS 3.4 + Typography Plugin + SCSS |
| **라우팅** | React Router DOM 7.9 |
| **상태 관리** | Zustand 5.0 |
| **API 통신** | Axios 1.12 |
| **에디터** | Tiptap v3 (StarterKit, Image, Link, List 등 확장 포함) |
| **애니메이션 / 인터랙션** | Framer Motion 12.23, Lottie-react 2.4 |
| **알림/UX** | React Hot Toast 2.6 |
| **지도 서비스** | @react-google-maps/api 2.20 |
| **슬라이드/캐러셀** | React Slick 0.31 + slick-carousel |
| **아이콘** | Lucide React 0.544 |
| **빌드 도구** | Vite 7.1 |
| **품질 관리** | ESLint 9.35 + Prettier + Typescript-eslint |
| **패키지 매니저** | pnpm |
| **배포** | Vercel (자동 빌드/배포) |
| **협업 도구** | GitHub, Notion |

---

## 🗂️ 폴더 구조

src/
├── api/ # Axios 기반 API 모듈 (auth, blog, cours, tour 등)
├── assets/ # 이미지 및 정적 리소스
├── common/ # 공통 유틸리티 (Loader 등)
├── components/
│ ├── aitravel/ # AI 여행 코스 관련 UI
│ ├── blog/ # 블로그 관련 컴포넌트
│ ├── home/ # 홈 및 메인 페이지 UI
│ ├── mypage/ # 마이페이지
│ ├── pieces/ # 여행 조각 관련 UI
│ ├── share/ # 공통 모달, 버튼 등 재사용 컴포넌트
│ └── tour/ # 여행지 상세/리스트 UI
├── constants/ # 카테고리 및 분류 상수
├── layout/ # 전체 레이아웃 컴포넌트
├── pages/ # 라우트 페이지 (aitravel, blogs, mypage, home, about 등)
├── router/ # React Router 설정
├── store/ # Zustand 상태관리 (authStore, modalStore 등)
├── types/ # TypeScript 타입 정의 (aitravel, blog, tour 등)
└── main.tsx # 진입점

---

## 🧠 기술적 포인트

### 💡 구조적 설계
- **모듈형 폴더 구조**로 도메인 단위 분리 (`aitravel`, `blog`, `tour` 등)
- API, Store, UI 컴포넌트를 명확히 계층화하여 유지보수성 확보  
- TypeScript 타입 정의를 모든 요청/응답 단위에 적용

### ⚡ 성능 및 사용자 경험
- `React.lazy` + `Suspense` 기반 **페이지 단위 코드 스플리팅**
- 이미지 캐러셀 및 지도는 **동적 import**로 로딩 최적화  
- `react-hot-toast`를 통한 **즉각적인 피드백 UX**

### 🧭 지도 및 위치 서비스
- `@react-google-maps/api`로 여행지 지도 및 동선 시각화  
- 여행지 간 거리 및 좌표 기반 루트 안내 기능 구현

### ✍️ AI 블로그 자동 생성
- `Tiptap Editor` 기반으로, 이미지·텍스트 블록 순서 보존 직렬화  
- 커스텀 확장을 통해 이미지 삽입, 링크, 리스트, 코드블록 등 지원  

### 🧩 여행 조각(Piece) 시스템
- 사용자별 수집한 여행지 데이터를 “조각”으로 시각화  
- 조각 개수 및 도시 수에 따른 **진척도 게이지 UI** 제공  
- 블로그와 조합하여 나만의 여행 퍼즐 완성

### 🪄 시각적 완성도
- `Framer Motion`을 통한 부드러운 페이지 전환  
- `Lottie` 기반 애니메이션 효과 및 `Confetti` 연출  
- TailwindCSS 기반 반응형 디자인 + 다크모드 대응  

---

## 🧩 실행 및 빌드

```bash
# 의존성 설치
pnpm install

# 개발 서버 실행
pnpm run dev

# 프로덕션 빌드
pnpm run build
```
> `.env` 파일에는 API 서버 주소, Google Maps API 키 등 환경변수를 포함합니다.

---

## 🧑‍💻 팀 & 협업

| 구분 | 내용 |
|------|------|
| **프론트엔드 담당** | 임재열 (단독 개발) |
| **협업 도구** | GitHub, Notion |
| **코드 컨벤션** | ESLint + Prettier 일관성 유지 |
| **버전 관리 전략** | feature 브랜치 단위 작업 후 main 병합 |

---

## 🌐 배포

- **플랫폼**: Netlify  
- **CI/CD**: FE 브랜치 푸시 시 자동 배포  
- **환경**: Vite + pnpm 기반 정적 빌드  

---

## 🏁 요약

LocalPiece는 **공공데이터 기반 여행 일정 생성**과  
**AI 블로그 자동 기록**을 하나의 서비스로 결합한  
**데이터·UX 중심형 프론트엔드 프로젝트**입니다.

React 기반 구조 설계와 상태 관리 최적화를 통해  
확장성과 유지보수성을 모두 확보했습니다.
