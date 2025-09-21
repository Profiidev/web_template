FROM node:22-alpine AS build

ARG URL
ENV PUBLIC_BACKEND_URL=${URL}
ENV PUBLIC_IS_APP=false

WORKDIR /app/frontend

COPY frontend/package.json frontend/svelte.config.js frontend/tsconfig.json frontend/vite.config.ts ./
COPY package-lock.json package.json ../

RUN npm ci

COPY frontend/src ./src
COPY frontend/static ./static

RUN npm run build

FROM node:22-alpine

RUN adduser -D static
USER static
WORKDIR /app

COPY --from=build /app/frontend/build .
COPY --from=build /app/frontend/package.json .
COPY --from=build /app/package-lock.json .

CMD ["node", "."]