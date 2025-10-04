# 1. Nginx를 베이스 이미지로 사용
FROM nginx:stable-alpine

# 2. 빌드된 React 앱을 Nginx의 html 폴더로 복사
# 빌드 후 dist 폴더 기준
COPY dist /usr/share/nginx/html

# 3. Nginx 설정 (기본 설정 사용 가능)
# 필요하면 커스텀 nginx.conf 복사 가능
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# 4. 포트 오픈
EXPOSE 80

# 5. 컨테이너 실행 시 Nginx 실행
CMD ["nginx", "-g", "daemon off;"]
