# =============================================================
# 1단계: 의존성 설치 (빌더 기반)
# =============================================================
FROM node:20-alpine AS base
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

# pnpm workspace 설정 복사
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json backend/package.json
COPY frontend/package.json frontend/package.json
COPY shared/package.json shared/package.json

# =============================================================
# 2단계: Shared 패키지 빌드
# =============================================================
FROM base AS shared-builder
COPY shared/ shared/
RUN pnpm --filter shared install --frozen-lockfile
RUN pnpm --filter shared build

# =============================================================
# 3단계: Backend 빌드
# =============================================================
FROM base AS backend-builder
COPY --from=shared-builder /app/shared /app/shared
COPY backend/ backend/
RUN pnpm --filter backend install --frozen-lockfile
RUN pnpm --filter backend build

# =============================================================
# 4단계: Frontend 빌드
# =============================================================
FROM base AS frontend-builder
COPY --from=shared-builder /app/shared /app/shared
COPY frontend/ frontend/
RUN pnpm --filter frontend install --frozen-lockfile
RUN pnpm --filter frontend build

# =============================================================
# 5단계: 프로덕션 이미지 (Backend + Frontend 정적 파일)
# =============================================================
FROM node:20-alpine AS production
RUN corepack enable && corepack prepare pnpm@latest --activate
WORKDIR /app

ENV NODE_ENV=production

# Backend 런타임 의존성만 설치
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY backend/package.json backend/package.json
COPY shared/package.json shared/package.json
RUN pnpm --filter backend --prod install --frozen-lockfile

# 빌드 결과물 복사
COPY --from=shared-builder /app/shared/dist /app/shared/dist
COPY --from=shared-builder /app/shared/package.json /app/shared/package.json
COPY --from=backend-builder /app/backend/dist /app/backend/dist
COPY --from=frontend-builder /app/frontend/dist /app/frontend/dist

# 헬스체크
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/v1/health || exit 1

EXPOSE 3000

CMD ["node", "backend/dist/main.js"]
