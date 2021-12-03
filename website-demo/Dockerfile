FROM node:16-alpine as builder
WORKDIR /app
COPY package.json ./
RUN npm i
COPY . .
ARG ENVIRONMENT=prod

RUN npm run build

FROM nginx:1.15.8-alpine

COPY nginx.conf /etc/nginx/conf.d/default.conf
RUN rm -rf /usr/share/nginx/html/*
COPY --from=builder /app/build /usr/share/nginx/html

CMD ["nginx", "-g", "daemon off;"]