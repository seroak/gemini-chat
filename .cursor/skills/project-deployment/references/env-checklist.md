# Environment Variable Checklist

## Backend (.env)

### 필수 (미설정 시 앱 실행 불가)

| 변수 | 예시 | 설명 |
|------|------|------|
| `PORT` | `3000` | 서버 포트 |
| `NODE_ENV` | `production` | 환경 구분 |
| `DB_HOST` | `postgres` (Docker) / `localhost` | DB 호스트 |
| `DB_PORT` | `5432` | DB 포트 |
| `DB_USERNAME` | `chatbot_user` | DB 사용자명 |
| `DB_PASSWORD` | `(강력한 비밀번호)` | DB 비밀번호 |
| `DB_DATABASE` | `ai_chatbot` | DB 이름 |
| `JWT_SECRET` | `(64자 이상 랜덤 문자열)` | JWT 서명 키 |
| `GEMINI_API_KEY` | `AIza...` | Google Gemini API 키 |

### 선택 (기본값 있음)

| 변수 | 기본값 | 설명 |
|------|--------|------|
| `JWT_EXPIRATION` | `7d` | 토큰 만료 시간 |
| `CORS_ORIGIN` | `http://localhost:5173` | 허용 Origin |
| `GEMINI_MODEL` | `gemini-2.0-flash-exp` | AI 모델명 |

## Frontend (.env)

| 변수 | 프로덕션 예시 | 설명 |
|------|---------------|------|
| `VITE_API_URL` | `https://api.example.com/api/v1` | 백엔드 API URL |
| `VITE_WS_URL` | `wss://api.example.com` | WebSocket URL |

## 프로덕션 보안 체크

- [ ] `JWT_SECRET`이 개발용과 다른 강력한 값인가?
- [ ] `DB_PASSWORD`가 충분히 강력한가?
- [ ] `CORS_ORIGIN`이 실제 도메인으로 설정되었는가?
- [ ] `NODE_ENV=production`인가?
- [ ] `.env` 파일이 `.gitignore`에 포함되어 있는가?
- [ ] HTTPS가 적용되어 있는가? (VITE_WS_URL이 `wss://`인가?)
