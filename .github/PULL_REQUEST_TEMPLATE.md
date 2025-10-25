## 🚀 작업 내용
- 소셜 로그인 기능(카카오, 구글)을 구현했습니다.
- 로그인 성공 시 JWT 토큰을 발급합니다.

<br>

## 📝 변경 사항
- `User` 엔티티에 소셜 로그인 관련 필드를 추가했습니다.
- `OAuth2` 인증을 처리하는 `CustomOAuth2UserService`를 구현했습니다.
- 토큰 발급을 위한 `JwtTokenProvider` 클래스를 추가했습니다.

<br>

## 🖼️ 스크린샷
<img width="700" alt="Postman_Test_Screenshot" src="https://user-images.githubusercontent.com/...">

<br>

## 💡 참고 사항
- 이번 작업은 이슈 #12 와 관련이 있습니다.
- OAuth2 관련 설정은 `application.yml`에 추가해야 하며, 각자 로컬에서 테스트 시 필요한 key는 별도로 전달하겠습니다.

<br>

---

### ✅ PR 유형
- [x] **Feature**: 새로운 기능 추가
- [ ] **Fix**: 버그 수정
- [ ] **Refactor**: 코드 리팩토링
- [ ] **Chore**: 빌드 관련 수정, 패키지 매니저 설정 등

<br>

### ✅ PR Checklist
- [x] `BE` 브랜치로 PR을 보내는 것이 맞나요?
- [x] PR의 라벨(label)을 올바르게 달았나요? (예: `Feature`, `Fix`)
- [x] 이 PR에서 CI 빌드 과정이 통과했나요?
