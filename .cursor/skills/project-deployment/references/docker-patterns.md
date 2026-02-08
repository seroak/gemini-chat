# Docker Patterns

## 멀티스테이지 빌드 원칙

1. **Build stage**: 전체 dependencies 설치 + 빌드
2. **Production stage**: production dependencies만 + 빌드 아티팩트 복사
3. **Alpine 이미지** 사용으로 크기 최소화

## .dockerignore

```
node_modules
dist
.git
.env
*.md
.cursor
docs
```

## Nginx 설정 (Frontend SPA)

```nginx
server {
    listen 80;
    root /usr/share/nginx/html;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # API 프록시 (선택)
    location /api/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
    }

    # WebSocket 프록시 (선택)
    location /socket.io/ {
        proxy_pass http://backend:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
    }

    # 캐싱
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

## Health Check

```yaml
# docker-compose.yml
backend:
  healthcheck:
    test: ["CMD", "curl", "-f", "http://localhost:3000/api/v1/health"]
    interval: 30s
    timeout: 10s
    retries: 3
```

## 유용한 명령어

```bash
# 전체 초기화 (볼륨 포함)
docker-compose down -v && docker-compose up --build

# 특정 서비스만 재시작
docker-compose restart backend

# 실행 중인 컨테이너 접속
docker-compose exec backend sh

# 이미지 크기 확인
docker images | grep ai-chatbot
```
