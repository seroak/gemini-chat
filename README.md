# AI Chatbot — Gemini SDK 기반 대화형 AI 시스템

Google Gemini SDK를 활용한 ChatGPT 스타일 AI 챗봇 시스템입니다.
실시간 스트리밍 응답, 대화 기록 관리, JWT 인증을 지원합니다.

## 주요 기능

- **실시간 스트리밍 응답** — WebSocket(Socket.IO)으로 AI 응답을 타이핑하듯 표시
- **대화 기록 관리** — 채팅 세션 및 메시지를 PostgreSQL에 저장/불러오기
- **사용자 인증** — JWT 기반 회원가입/로그인
- **ChatGPT 스타일 UI** — 사이드바 대화 목록 + 메인 채팅 인터페이스
- **마크다운 렌더링** — 코드 블록(구문 강조), 표, 링크 등 지원

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19 + Vite + TypeScript + Tailwind CSS v4 |
| Backend | NestJS v11 + TypeORM + PostgreSQL 16 |
| AI | Google Gemini SDK (`@google/generative-ai`) |
| 인증 | Passport + JWT |
| 실시간 | Socket.IO |
| 테스트 | Vitest (Frontend) + Jest (Backend) |
| 컨테이너 | Docker + Docker Compose |

## 사전 요구사항

- **Node.js** >= 20.0.0
- **pnpm** >= 9.0.0
- **Docker** + Docker Compose (PostgreSQL용)
- **Google Gemini API Key** ([발급 링크](https://makersuite.google.com/app/apikey))

## 빠른 시작

### 1. 저장소 클론

```bash
git clone <repository-url>
cd web_game2
```

### 2. 환경변수 설정

```bash
# Backend 환경변수
cp backend/.env.example backend/.env
# frontend 환경변수
cp frontend/.env.example frontend/.env
```

`backend/.env`를 열어 아래 항목을 수정하세요:

```env
JWT_SECRET=your-secure-random-string-here
GEMINI_API_KEY=your-gemini-api-key-here
```

### 3. PostgreSQL 시작

```bash
docker-compose up -d
```

### 4. 의존성 설치 및 실행

```bash
# 전체 의존성 설치
pnpm install

# 프론트엔드 + 백엔드 동시 실행
pnpm dev
```

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000/api/v1
- **API 문서 (Swagger)**: http://localhost:3000/api/docs

### 5. (선택) 마이그레이션 및 시드 데이터

```bash
# 마이그레이션 실행 (프로덕션용)
pnpm --filter backend migration:run

# 테스트 사용자 생성
pnpm --filter backend seed:run
```

시드 계정:
- `test@example.com` / `password123`
- `admin@example.com` / `admin1234`

## 프로젝트 구조

```
web_game2/
├── frontend/src/
│   ├── components/       # UI 컴포넌트 (common, layout, chat, auth)
│   ├── pages/            # 페이지 (login, register, chat)
│   ├── hooks/            # 커스텀 훅 (use-auth, use-chat, use-streaming)
│   ├── stores/           # Zustand 상태 관리
│   ├── services/         # API 클라이언트 (Axios)
│   └── styles/           # Tailwind CSS
├── backend/src/
│   ├── modules/          # NestJS 모듈 (auth, users, chat, gemini)
│   ├── common/           # 데코레이터, 필터, 인터셉터, 미들웨어
│   ├── config/           # 설정 (DB, Gemini)
│   └── database/         # 마이그레이션, 시드
└── shared/src/           # 공유 타입, 상수, 유틸리티
```

## 개발 명령어

| 명령어 | 설명 |
|--------|------|
| `pnpm dev` | 프론트엔드 + 백엔드 동시 실행 |
| `pnpm build` | 전체 빌드 |
| `pnpm --filter frontend test` | 프론트엔드 테스트 |
| `pnpm --filter backend test` | 백엔드 단위 테스트 |
| `pnpm --filter backend test:e2e` | 백엔드 E2E 테스트 |
| `docker-compose up -d` | PostgreSQL 시작 |
| `docker-compose down` | PostgreSQL 종료 |

## 환경변수

### Backend (`backend/.env`)

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `PORT` | 서버 포트 | `3000` |
| `NODE_ENV` | 실행 환경 | `development` |
| `DB_HOST` | PostgreSQL 호스트 | `localhost` |
| `DB_PORT` | PostgreSQL 포트 | `5432` |
| `DB_USERNAME` | DB 사용자 | `postgres` |
| `DB_PASSWORD` | DB 비밀번호 | `postgres` |
| `DB_DATABASE` | DB 이름 | `ai_chatbot` |
| `JWT_SECRET` | JWT 시크릿 키 | **(필수 설정)** |
| `JWT_EXPIRATION` | 토큰 만료 시간 | `7d` |
| `CORS_ORIGIN` | CORS 허용 도메인 | `http://localhost:5173` |
| `GEMINI_API_KEY` | Gemini API 키 | **(필수 설정)** |
| `GEMINI_MODEL` | Gemini 모델 | `gemini-2.0-flash-exp` |

### Frontend (`frontend/.env`)

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `VITE_API_URL` | API 서버 URL | `http://localhost:3000/api/v1` |
| `VITE_WS_URL` | WebSocket URL | `ws://localhost:3000` |

## 프로덕션 빌드 (Docker)

```bash
# 이미지 빌드
docker build -t ai-chatbot .

# 컨테이너 실행
docker run -p 3000:3000 \
  -e DB_HOST=your-db-host \
  -e JWT_SECRET=your-secret \
  -e GEMINI_API_KEY=your-key \
  ai-chatbot
```

## 라이선스

MIT
# gemini-chat
