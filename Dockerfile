FROM node:lts-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY blog/package*.json ./blog/
COPY photos/package*.json ./photos/

RUN npm install

COPY . .

RUN npm run build

FROM nginx:alpine

RUN rm -rf /usr/share/nginx/html/*

COPY --from=builder /app/index.html /usr/share/nginx/html/
COPY --from=builder /app/style.css /usr/share/nginx/html/
COPY --from=builder /app/script.js /usr/share/nginx/html/
COPY --from=builder /app/404.html /usr/share/nginx/html/
COPY --from=builder /app/reset.css /usr/share/nginx/html/
COPY --from=builder /app/robots.txt /usr/share/nginx/html/

COPY --from=builder /app/about_me /usr/share/nginx/html/about_me
COPY --from=builder /app/assets /usr/share/nginx/html/assets
COPY --from=builder /app/fonts /usr/share/nginx/html/fonts
COPY --from=builder /app/links /usr/share/nginx/html/links

COPY --from=builder /app/blog/_site /usr/share/nginx/html/blog
COPY --from=builder /app/photos/_site /usr/share/nginx/html/photos

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]