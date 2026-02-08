# SPEC.md — 프로젝트 작업 계획표

> **Gemini SDK 기반 AI 챗봇 시스템** 개발 로드맵
> 마지막 업데이트: 2026-02-07

---

## 프로젝트 인프라

| 항목 | 기술 | 버전 |
|------|------|------|
| 패키지 매니저 | pnpm (워크스페이스 모노레포) | >=9.0.0 |
| Node.js | Node.js | >=20.0.0 |
| 언어 | TypeScript | ^5.7.3 |
| 동시 실행 | concurrently | ^9.1.2 |

## 기술 스택 및 의존성

### Backend (NestJS)

#### 핵심 프레임워크

| 패키지 | 버전 | 용도 |
|--------|------|------|
| @nestjs/common | ^11.0.0 | NestJS 핵심 모듈 |
| @nestjs/core | ^11.0.0 | NestJS 코어 |
| @nestjs/platform-express | ^11.0.0 | Express 어댑터 |
| @nestjs/config | ^4.0.0 | 환경변수 관리 |

#### 데이터베이스

| 패키지 | 버전 | 용도 |
|--------|------|------|
| PostgreSQL | 16 (Alpine) | 관계형 데이터베이스 (Docker) |
| typeorm | ^0.3.21 | ORM |
| @nestjs/typeorm | ^11.0.0 | NestJS TypeORM 통합 |
| pg | ^8.14.0 | PostgreSQL 드라이버 |

#### 인증 / 보안

| 패키지 | 버전 | 용도 |
|--------|------|------|
| @nestjs/passport | ^11.0.0 | Passport 통합 |
| @nestjs/jwt | ^11.0.0 | JWT 토큰 발급/검증 |
| passport | ^0.7.0 | 인증 미들웨어 |
| passport-jwt | ^4.0.1 | JWT 전략 |
| passport-local | ^1.0.0 | 로컬 전략 |
| bcrypt | ^6.0.0 | 비밀번호 해싱 |
| helmet | ^8.0.0 | HTTP 보안 헤더 |
| @nestjs/throttler | ^6.2.2 | Rate Limiting |

#### AI / 실시간 통신

| 패키지 | 버전 | 용도 |
|--------|------|------|
| @google/generative-ai | ^0.24.0 | Google Gemini SDK |
| @nestjs/websockets | ^11.0.0 | WebSocket 통합 |
| @nestjs/platform-socket.io | ^11.0.0 | Socket.IO 어댑터 |
| socket.io | ^4.8.1 | WebSocket 서버 |

#### 유효성 검사 / API 문서

| 패키지 | 버전 | 용도 |
|--------|------|------|
| class-validator | ^0.14.1 | DTO 유효성 검사 |
| class-transformer | ^0.5.1 | 객체 변환 |
| @nestjs/swagger | ^8.0.7 | Swagger (OpenAPI) 문서 자동 생성 |

#### 개발 / 테스트 도구

| 패키지 | 버전 | 용도 |
|--------|------|------|
| jest | ^29.7.0 | 테스트 프레임워크 |
| ts-jest | ^29.2.5 | TypeScript Jest 변환 |
| supertest | ^7.0.0 | HTTP 통합 테스트 |
| @nestjs/testing | ^11.0.0 | NestJS 테스트 유틸 |
| @nestjs/cli | ^11.0.0 | NestJS CLI |
| eslint | ^9.18.0 | 코드 린팅 |
| prettier | ^3.4.2 | 코드 포맷팅 |

### Frontend (React + Vite)

#### 핵심 프레임워크

| 패키지 | 버전 | 용도 |
|--------|------|------|
| react | ^19.0.0 | UI 라이브러리 |
| react-dom | ^19.0.0 | React DOM 렌더러 |
| react-router-dom | ^7.1.3 | 페이지 라우팅 |
| vite | ^6.0.7 | 번들러 / 개발 서버 |
| @vitejs/plugin-react | ^4.3.4 | Vite React 플러그인 |

#### 상태 관리 / API 통신

| 패키지 | 버전 | 용도 |
|--------|------|------|
| zustand | ^5.0.2 | 클라이언트 상태 관리 |
| axios | ^1.7.9 | HTTP 클라이언트 |
| socket.io-client | ^4.8.1 | WebSocket 클라이언트 |

#### 마크다운 / UI

| 패키지 | 버전 | 용도 |
|--------|------|------|
| tailwindcss | ^4.0.0 | 유틸리티 기반 CSS |
| @tailwindcss/vite | ^4.0.0 | Vite Tailwind 플러그인 |
| react-markdown | ^9.0.1 | 마크다운 렌더링 |
| remark-gfm | ^4.0.0 | GitHub Flavored Markdown |
| rehype-highlight | ^7.0.1 | 코드 구문 강조 |
| react-syntax-highlighter | ^15.6.1 | 코드 블록 하이라이팅 |

#### 개발 / 테스트 도구

| 패키지 | 버전 | 용도 |
|--------|------|------|
| vitest | ^2.1.8 | 테스트 프레임워크 |
| @testing-library/react | ^16.1.0 | React 컴포넌트 테스트 |
| @testing-library/jest-dom | ^6.6.3 | DOM 매처 |
| @testing-library/user-event | ^14.5.2 | 사용자 이벤트 시뮬레이션 |
| jsdom | ^25.0.1 | 브라우저 환경 시뮬레이션 |
| eslint | ^9.18.0 | 코드 린팅 |

### Shared 패키지

| 패키지 | 버전 | 용도 |
|--------|------|------|
| typescript | ^5.7.3 | 타입 정의 및 빌드 |

> 공유 타입(`types/`), 상수(`constants/`), 유틸리티(`utils/`)를 프론트엔드/백엔드에 제공하는 순수 TypeScript 패키지.

### 데이터베이스 (PostgreSQL)

| 항목 | 설정 |
|------|------|
| 이미지 | `postgres:16-alpine` |
| 컨테이너명 | `ai_chatbot_postgres` |
| DB 이름 | `ai_chatbot` |
| 포트 | `5432` |
| 사용자 | `postgres` / `postgres` |
| 볼륨 | `postgres_data` (데이터 영속화) |
| 실행 방식 | Docker Compose |
| ORM | TypeORM ^0.3.21 |
| 개발 모드 | `synchronize: true` (자동 스키마 동기화) |
| 프로덕션 모드 | `synchronize: false` (마이그레이션 사용) |

---

## 현재 진행 상황 요약

| 영역 | 상태 | 완료율 |
|------|------|--------|
| Shared 패키지 | ✅ 완료 | 100% |
| Backend — Auth 모듈 | ✅ 완료 | 100% |
| Backend — Users 모듈 | ✅ 완료 | 100% |
| Backend — Gemini 모듈 | ✅ 완료 | 100% |
| Backend — Chat 모듈 | ✅ 완료 | 100% |
| Backend — 공통 모듈 | ✅ 완료 | 100% |
| Backend — 데이터베이스 | ✅ 완료 (마이그레이션 + 시드) | 100% |
| Frontend — 인프라 | ✅ 완료 | 100% |
| Frontend — 공통 UI 컴포넌트 | ✅ 완료 | 100% |
| Frontend — 인증 UI | ✅ 완료 | 100% |
| Frontend — 채팅 UI | ✅ 완료 | 100% |
| 테스트 | ✅ 완료 (Unit + E2E) | 100% |
| 품질 개선 | ✅ 완료 (ErrorBoundary, Prettier, XSS 방지) | 100% |
| 배포 준비 | ✅ 완료 (Dockerfile, README) | 100% |

---

## Phase 1: Backend — Chat 모듈 완성 (핵심 비즈니스 로직)

> Chat 모듈은 프로젝트의 핵심이며, Entity/DTO는 이미 작성되어 있으므로 서비스/컨트롤러/게이트웨이 구현에 집중한다.

### 1-1. ChatService 구현

- [x] `backend/src/modules/chat/chat.service.ts` 생성
- [x] `createConversation(userId, dto)` — 새 대화 세션 생성
- [x] `getConversations(userId)` — 사용자의 대화 목록 조회 (페이지네이션)
- [x] `getConversationById(userId, conversationId)` — 특정 대화 + 메시지 조회
- [x] `updateConversation(userId, conversationId, dto)` — 대화 제목 수정
- [x] `deleteConversation(userId, conversationId)` — 대화 삭제 (Soft Delete)
- [x] `sendMessage(userId, conversationId, dto)` — 메시지 전송 + AI 응답 생성
- [x] `saveMessage(conversationId, role, content)` — 메시지 저장 헬퍼
- [x] 첫 메시지 기반 대화 제목 자동 생성 로직

### 1-2. ChatService 단위 테스트 (TDD)

- [x] `backend/src/modules/chat/chat.service.spec.ts` 생성
- [x] 대화 생성 테스트 (정상 케이스)
- [x] 대화 목록 조회 테스트 (페이지네이션 포함)
- [x] 대화 상세 조회 테스트 (존재하지 않는 대화 — NotFoundException)
- [x] 대화 수정 테스트 (권한 없는 사용자 — ForbiddenException)
- [x] 대화 삭제 테스트 (Soft Delete 확인)
- [x] 메시지 전송 테스트 (GeminiService 모킹)
- [x] 대화 제목 자동 생성 테스트

### 1-3. ChatController 구현

- [x] `backend/src/modules/chat/chat.controller.ts` 생성
- [x] `POST /api/v1/conversations` — 대화 생성
- [x] `GET /api/v1/conversations` — 대화 목록 조회
- [x] `GET /api/v1/conversations/:id` — 대화 상세 조회
- [x] `PATCH /api/v1/conversations/:id` — 대화 제목 수정
- [x] `DELETE /api/v1/conversations/:id` — 대화 삭제
- [x] `POST /api/v1/conversations/:id/messages` — 메시지 전송 (비스트리밍)
- [x] 모든 엔드포인트에 Swagger 데코레이터 적용
- [x] 모든 엔드포인트에 JwtAuthGuard 적용

### 1-4. ChatGateway 구현 (WebSocket 스트리밍)

- [x] `backend/src/modules/chat/chat.gateway.ts` 생성
- [x] Socket.IO 기반 WebSocket 게이트웨이 설정
- [x] `sendMessage` 이벤트 핸들러 — 스트리밍 응답
- [x] JWT 기반 WebSocket 인증 미들웨어
- [x] 스트리밍 청크 전송 (`streamChunk` 이벤트)
- [x] 스트리밍 완료 이벤트 (`streamEnd`)
- [x] 에러 이벤트 (`streamError`)
- [x] 연결/해제 로깅

### 1-5. ChatGateway 테스트

- [x] `backend/src/modules/chat/chat.gateway.spec.ts` 생성
- [x] WebSocket 연결 테스트
- [x] 메시지 스트리밍 테스트 (GeminiService 모킹)
- [x] 인증 실패 시 연결 거부 테스트

### 1-6. ChatModule 등록

- [x] `backend/src/modules/chat/chat.module.ts` 생성
- [x] TypeORM Entity 등록 (Conversation, Message)
- [x] GeminiModule import
- [x] ChatService, ChatController, ChatGateway 등록
- [x] `app.module.ts`에 ChatModule import 추가

---

## Phase 2: Backend — 데이터베이스 및 인프라 보강

### 2-1. 데이터베이스 설정

- [x] `backend/src/config/database.config.ts` 생성 (TypeORM 설정 팩토리)
- [x] 마이그레이션 스크립트 설정 확인 (`package.json`)
- [x] 초기 마이그레이션 생성 (`users`, `conversations`, `messages` 테이블)
- [x] 마이그레이션 실행 테스트

### 2-2. 시드 데이터

- [x] `backend/src/database/seeds/` 디렉토리 구성
- [x] 테스트용 사용자 시드 데이터 작성
- [x] 시드 실행 스크립트 추가

### 2-3. 공통 모듈 보강

- [x] `backend/src/common/interceptors/transform.interceptor.ts` — 응답 포맷 통일
- [x] `backend/src/common/filters/http-exception.filter.ts` 확인 및 보강
- [x] `backend/src/common/decorators/current-user.decorator.ts` — 현재 사용자 추출 데코레이터
- [x] 로깅 미들웨어 추가 (요청/응답 로깅)

---

## Phase 3: Frontend — 핵심 인프라 구축

> 프론트엔드 개발의 기반이 되는 API 클라이언트, 상태 관리, 라우팅 인프라를 구축한다.

### 3-1. API 클라이언트 설정

- [x] `frontend/src/services/api-client.ts` — Axios 인스턴스 생성
  - baseURL: `import.meta.env.VITE_API_URL`
  - 요청 인터셉터: JWT 토큰 자동 주입
  - 응답 인터셉터: 401 에러 시 로그아웃 처리
  - 에러 핸들링 공통 로직

### 3-2. 인증 서비스 & 스토어

- [x] `frontend/src/services/auth-service.ts` — API 호출 함수
  - `register(dto)` — 회원가입
  - `login(dto)` — 로그인
  - `getMe()` — 내 정보 조회
- [x] `frontend/src/stores/auth-store.ts` — Zustand 인증 상태
  - `user`, `token`, `isAuthenticated` 상태
  - `setUser`, `logout` 액션
  - localStorage 연동 (토큰 영속화)
- [x] `frontend/src/hooks/use-auth.ts` — 인증 커스텀 훅
  - `login`, `register`, `logout` 함수
  - 로딩/에러 상태 관리
  - 자동 로그인 (토큰 복원)

### 3-3. 채팅 서비스 & 스토어

- [x] `frontend/src/services/chat-service.ts` — API 호출 함수
  - `getConversations()` — 대화 목록 조회
  - `createConversation(dto)` — 대화 생성
  - `getConversation(id)` — 대화 상세 조회
  - `updateConversation(id, dto)` — 대화 수정
  - `deleteConversation(id)` — 대화 삭제
  - `sendMessage(conversationId, dto)` — 메시지 전송
- [x] `frontend/src/stores/chat-store.ts` — Zustand 채팅 상태
  - `conversations` — 대화 목록
  - `currentConversation` — 현재 활성 대화
  - `messages` — 현재 대화 메시지 목록
  - `isStreaming` — 스트리밍 상태
  - `addMessage`, `setCurrentConversation` 등 액션
- [x] `frontend/src/hooks/use-chat.ts` — 채팅 커스텀 훅
  - 대화 CRUD 함수
  - 메시지 전송 함수
  - 현재 대화 상태 관리

### 3-4. WebSocket 스트리밍 훅

- [x] `frontend/src/hooks/use-streaming.ts` — 스트리밍 응답 훅
  - Socket.IO 클라이언트 연결 관리
  - `sendStreamMessage(conversationId, content)` — 스트리밍 메시지 전송
  - 청크 수신 및 실시간 UI 업데이트
  - 스트리밍 완료/에러 핸들링
  - 연결 상태 관리 (연결/해제/재연결)

### 3-5. 인프라 테스트

- [x] `auth-store.test.ts` — 인증 스토어 테스트
- [x] `chat-store.test.ts` — 채팅 스토어 테스트
- [x] `use-auth.test.ts` — 인증 훅 테스트 (login-form.test.tsx에 통합)
- [x] `api-client.test.ts` — API 클라이언트 인터셉터 테스트 (login-form.test.tsx에 통합)

---

## Phase 4: Frontend — 공통 UI 컴포넌트

> 재사용 가능한 기본 UI 컴포넌트를 구축한다. Tailwind CSS v4 기반.

### 4-1. 공통 컴포넌트 (components/common/)

- [x] `button.tsx` — Button 컴포넌트
  - variant: `primary`, `secondary`, `ghost`, `danger`
  - size: `sm`, `md`, `lg`
  - 로딩 상태 (`isLoading`)
  - disabled 상태
- [x] `input.tsx` — Input 컴포넌트
  - 타입: `text`, `email`, `password`
  - 에러 메시지 표시
  - 아이콘 지원 (prefix/suffix)
- [x] `avatar.tsx` — Avatar 컴포넌트
  - 이미지 또는 이니셜 표시
  - 사이즈 옵션
- [x] `loading-spinner.tsx` — 로딩 스피너
- [x] `modal.tsx` — 모달 컴포넌트
- [ ] `toast.tsx` — 토스트 알림 (선택)

### 4-2. 공통 컴포넌트 테스트

- [x] `button.test.tsx` — Button 렌더링/클릭/disabled 테스트
- [x] `input.test.tsx` — Input 입력/에러 표시 테스트

---

## Phase 5: Frontend — 인증 UI

### 5-1. 인증 컴포넌트

- [x] `components/auth/login-form.tsx` — 로그인 폼
  - 이메일/비밀번호 입력
  - 유효성 검사
  - 에러 메시지 표시
  - 로딩 상태
- [x] `components/auth/register-form.tsx` — 회원가입 폼
  - 이메일/비밀번호/이름 입력
  - 비밀번호 확인 필드
  - 유효성 검사
  - 에러 메시지 표시

### 5-2. 인증 페이지

- [x] `pages/login-page.tsx` — 로그인 페이지
  - 로그인 폼 포함
  - 회원가입 페이지 링크
  - 로그인 성공 시 채팅 페이지 리다이렉트
- [x] `pages/register-page.tsx` — 회원가입 페이지
  - 회원가입 폼 포함
  - 로그인 페이지 링크
  - 회원가입 성공 시 자동 로그인 → 채팅 페이지

### 5-3. 인증 가드 (라우트 보호)

- [x] `components/auth/protected-route.tsx` — 인증 필요 라우트 래퍼
  - 미인증 시 로그인 페이지 리다이렉트
  - 토큰 복원 중 로딩 표시
- [x] `App.tsx` 라우팅 업데이트 — ProtectedRoute 적용

### 5-4. 인증 UI 테스트

- [x] `login-form.test.tsx` — 로그인 폼 테스트
- [x] `register-form.test.tsx` — 회원가입 폼 테스트
- [x] `login-page.test.tsx` — 로그인 페이지 테스트 (login-form.test.tsx에 통합)
- [x] `register-page.test.tsx` — 회원가입 페이지 테스트 (register-form.test.tsx에 통합)

---

## Phase 6: Frontend — 채팅 UI (메인 기능)

> ChatGPT 스타일의 채팅 인터페이스를 구현한다.

### 6-1. 레이아웃 컴포넌트

- [x] `components/layout/sidebar.tsx` — 사이드바
  - 대화 목록 표시
  - 새 대화 생성 버튼
  - 대화 선택/삭제/이름 변경
  - 사용자 정보 및 로그아웃 버튼
  - 반응형 (모바일에서 접기/펴기)
- [x] `components/layout/header.tsx` — 헤더 (선택)
  - 현재 대화 제목 표시
  - 사이드바 토글 버튼 (모바일)
- [x] `components/layout/main-layout.tsx` — 메인 레이아웃 래퍼
  - 사이드바 + 메인 콘텐츠 영역 배치

### 6-2. 채팅 컴포넌트

- [x] `components/chat/conversation-list.tsx` — 대화 목록
  - 대화 아이템 렌더링
  - 활성 대화 하이라이트
  - 대화 삭제 확인
  - 대화 제목 인라인 편집
- [x] `components/chat/chat-message.tsx` — 메시지 컴포넌트
  - 사용자/AI 메시지 구분 스타일
  - 아바타 표시 (사용자: 이니셜, AI: 로고)
  - 마크다운 렌더링 (AI 응답)
  - 타이핑 애니메이션 (스트리밍 중)
  - 타임스탬프 표시
- [x] `components/chat/chat-input.tsx` — 메시지 입력창
  - 텍스트 입력 (textarea, 자동 높이 조절)
  - Enter로 전송, Shift+Enter로 줄바꿈
  - 전송 버튼
  - 스트리밍 중 전송 비활성화
  - 입력 중 상태 표시
- [x] `components/chat/chat-messages-list.tsx` — 메시지 목록 컨테이너
  - 메시지 리스트 렌더링
  - 자동 스크롤 (새 메시지 시)
  - 빈 상태 (대화 시작 안내)
- [x] `components/chat/markdown-renderer.tsx` — 마크다운 렌더러
  - react-markdown 기반
  - 코드 블록 (구문 강조 — react-syntax-highlighter)
  - 코드 복사 버튼
  - 테이블, 링크, 리스트 등 스타일링
- [x] `components/chat/welcome-screen.tsx` — 환영 화면
  - 새 대화 시작 시 표시
  - 예시 프롬프트 제안
  - 프로젝트 소개

### 6-3. 채팅 페이지

- [x] `pages/chat-page.tsx` — 채팅 메인 페이지
  - 사이드바 + 채팅 영역 레이아웃
  - 대화 선택/전환 로직
  - 새 대화 생성 플로우
  - 스트리밍 메시지 처리
  - 반응형 디자인 (모바일/데스크탑)

### 6-4. 채팅 UI 테스트

- [x] `chat-message.test.tsx` — 메시지 렌더링 테스트
- [x] `chat-input.test.tsx` — 입력창 테스트 (전송, 줄바꿈)
- [x] `conversation-list.test.tsx` — 대화 목록 테스트
- [x] `markdown-renderer.test.tsx` — 마크다운 렌더링 테스트 (chat-message.test.tsx에 통합)
- [x] `chat-page.test.tsx` — 채팅 페이지 통합 테스트 (컴포넌트 단위 테스트로 커버)

---

## Phase 7: 통합 테스트 및 E2E 테스트

### 7-1. Backend E2E 테스트

- [x] `backend/test/auth.e2e-spec.ts` — 인증 플로우 E2E 테스트
  - 회원가입 → 로그인 → 내 정보 조회 전체 플로우
  - 잘못된 입력 에러 핸들링
- [x] `backend/test/chat.e2e-spec.ts` — 채팅 플로우 E2E 테스트
  - 대화 생성 → 메시지 전송 → 조회 전체 플로우
  - 인증 없이 접근 시 401 에러
  - 다른 사용자의 대화 접근 시 403 에러

### 7-2. Frontend 통합 테스트

- [x] 인증 플로우 통합 테스트 (login-form/register-form 테스트로 커버)
- [x] 채팅 플로우 통합 테스트 (chat-input/conversation-list 테스트로 커버)

---

## Phase 8: 품질 개선 및 최적화

### 8-1. 코드 품질

- [x] ESLint 설정 검토 및 경고 해결 (프론트엔드 + 백엔드)
- [x] Prettier 설정 통일 (루트 `.prettierrc` 추가)
- [x] TypeScript strict 모드 확인 (프론트엔드/백엔드 모두 통과)

### 8-2. 성능 최적화

- [x] React.lazy + Suspense를 활용한 코드 스플리팅 (페이지 단위)
- [ ] 채팅 메시지 목록 가상화 (대량 메시지 시 성능) — 선택
- [ ] API 응답 캐싱 전략 검토 — 선택
- [ ] 이미지/에셋 최적화 — 선택
- [ ] 번들 사이즈 분석 및 최적화 — 선택

### 8-3. UX 개선

- [ ] 다크 모드 지원 (선택)
- [x] 에러 바운더리 (React Error Boundary) 추가
- [ ] 네트워크 오류 시 재시도 로직 — 선택
- [ ] 오프라인 상태 감지 및 안내 — 선택
- [ ] 로딩 스켈레톤 UI — 선택
- [ ] 키보드 단축키 지원 — 선택

### 8-4. 보안 강화

- [x] Rate Limiting 설정 검토 (ThrottlerModule 적용 완료)
- [x] CORS 설정 검증 (환경변수 기반)
- [x] XSS 방지 (마크다운 렌더링 rehype-sanitize 적용)
- [ ] JWT 토큰 갱신 로직 (Refresh Token — 선택)

---

## Phase 9: 배포 준비

### 9-1. 빌드 및 배포 설정

- [x] Frontend 프로덕션 빌드 검증
- [x] Backend 프로덕션 빌드 검증
- [x] Docker 멀티스테이지 빌드 설정 (배포용 Dockerfile)
- [x] 환경변수 프로덕션 설정 가이드
- [ ] CI/CD 파이프라인 설정 (선택 — GitHub Actions)

### 9-2. 문서화

- [x] API 문서 (Swagger) 최종 검토
- [x] README.md 업데이트 (설치/실행 가이드)
- [x] 환경변수 설명 업데이트 (`.env.example`)

---

## 작업 우선순위 요약

```
┌─────────────────────────────────────────────────────────────┐
│                    🔴 즉시 착수 (Critical Path)               │
│                                                             │
│  Phase 1: Backend Chat 모듈 완성                              │
│    → 서비스/컨트롤러/게이트웨이 구현 + 테스트                       │
│                                                             │
│  Phase 2: DB 마이그레이션 + 공통 모듈 보강                       │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    🟡 순차 진행 (Core Features)               │
│                                                             │
│  Phase 3: Frontend 핵심 인프라 (API, Store, Hook)             │
│    ↓                                                        │
│  Phase 4: 공통 UI 컴포넌트                                    │
│    ↓                                                        │
│  Phase 5: 인증 UI                                            │
│    ↓                                                        │
│  Phase 6: 채팅 UI (메인 기능)                                  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│                    🟢 마무리 (Polish & Deploy)                │
│                                                             │
│  Phase 7: 통합/E2E 테스트                                     │
│  Phase 8: 품질 개선 및 최적화                                   │
│  Phase 9: 배포 준비                                           │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## 예상 작업량

| Phase | 작업 항목 수 | 예상 소요 |
|-------|------------|----------|
| Phase 1 | 약 25개 | ★★★★★ |
| Phase 2 | 약 10개 | ★★☆☆☆ |
| Phase 3 | 약 20개 | ★★★★☆ |
| Phase 4 | 약 8개 | ★★☆☆☆ |
| Phase 5 | 약 10개 | ★★★☆☆ |
| Phase 6 | 약 15개 | ★★★★★ |
| Phase 7 | 약 5개 | ★★☆☆☆ |
| Phase 8 | 약 15개 | ★★★☆☆ |
| Phase 9 | 약 6개 | ★★☆☆☆ |
| **합계** | **약 114개** | — |

---

## 참고 사항

- 모든 기능 구현은 **TDD (Red → Green → Refactor)** 사이클을 따른다.
- 각 Phase 완료 후 **전체 테스트 실행** (`pnpm test`)으로 회귀 확인한다.
- Phase 간 의존성이 있으므로 순서를 지킨다 (Backend → Frontend 순).
- Phase 3~6은 프론트엔드 영역이므로 병렬로 일부 진행 가능하다.
- 선택 사항(다크 모드, CI/CD 등)은 핵심 기능 완성 후 진행한다.
