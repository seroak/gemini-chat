---
name: project-deployment
description: >
  Docker 멀티스테이지 빌드, docker-compose 설정, 환경변수 관리,
  프로덕션 배포 워크플로. "배포", "Docker", "프로덕션", "컨테이너",
  "docker-compose" 요청 시 트리거.
---

# Project Deployment

Docker 기반 프로덕션 배포 워크플로.

## 배포 체크리스트

```
Task Progress:
- [ ] Step 1: 환경변수 확인
- [ ] Step 2: Docker 이미지 빌드
- [ ] Step 3: docker-compose 설정
- [ ] Step 4: 빌드 및 실행 테스트
- [ ] Step 5: 프로덕션 환경 배포
```

## Step 1: 환경변수 확인

배포 전 필수 환경변수가 모두 설정되었는지 확인.

상세 체크리스트: [references/env-checklist.md](references/env-checklist.md)

## Step 2: Docker 이미지 빌드

멀티스테이지 빌드로 이미지 크기 최소화.

### Frontend (Nginx 서빙)

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY frontend/package.json frontend/
COPY shared/package.json shared/
RUN pnpm install --frozen-lockfile
COPY shared/ shared/
COPY frontend/ frontend/
RUN pnpm --filter frontend build

# Production stage
FROM nginx:alpine
COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
```

### Backend (Node.js)

```dockerfile
# Build stage
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json backend/
COPY shared/package.json shared/
RUN pnpm install --frozen-lockfile
COPY shared/ shared/
COPY backend/ backend/
RUN pnpm --filter backend build

# Production stage
FROM node:20-alpine
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@latest --activate
COPY --from=build /app/pnpm-lock.yaml /app/pnpm-workspace.yaml /app/package.json ./
COPY --from=build /app/backend/package.json backend/
COPY --from=build /app/shared/package.json shared/
RUN pnpm install --frozen-lockfile --prod
COPY --from=build /app/backend/dist backend/dist/
COPY --from=build /app/shared/dist shared/dist/
EXPOSE 3000
CMD ["node", "backend/dist/main"]
```

## Step 3: docker-compose

```yaml
version: '3.8'
services:
  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: ${DB_DATABASE}
      POSTGRES_USER: ${DB_USERNAME}
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    ports:
      - '5432:5432'
    volumes:
      - pgdata:/var/lib/postgresql/data

  backend:
    build:
      context: .
      dockerfile: backend/Dockerfile
    ports:
      - '3000:3000'
    env_file: backend/.env
    depends_on:
      - postgres

  frontend:
    build:
      context: .
      dockerfile: frontend/Dockerfile
    ports:
      - '80:80'
    depends_on:
      - backend

volumes:
  pgdata:
```

## Step 4: 빌드 및 테스트

```bash
# 전체 빌드 및 실행
docker-compose up --build

# 개별 서비스 빌드
docker-compose build backend
docker-compose build frontend

# 로그 확인
docker-compose logs -f backend
```

## Step 5: 프로덕션 배포

1. 환경변수를 프로덕션 값으로 설정
2. `NODE_ENV=production` 확인
3. JWT_SECRET을 강력한 랜덤 값으로 변경
4. CORS_ORIGIN을 실제 도메인으로 설정
5. 데이터베이스 마이그레이션 실행

상세 Docker 패턴: [references/docker-patterns.md](references/docker-patterns.md)
