# ── Stage 1: Build ────────────────────────────────────────────────────────────
FROM node:18-alpine AS build
WORKDIR /app

ENV SKIP_PREFLIGHT_CHECK=true
ENV DISABLE_ESLINT_PLUGIN=true
ENV CI=false

COPY package.json ./
RUN npm install --legacy-peer-deps && \
    npm install ajv@^8 ajv-keywords@^5 --legacy-peer-deps

COPY . .
RUN npm run build

# ── Stage 2: Serve ────────────────────────────────────────────────────────────
FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 3000
CMD ["nginx", "-g", "daemon off;"]
