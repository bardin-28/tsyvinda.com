FROM node:lts

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund --progress=false --ignore-scripts

COPY . .

ARG API_URL=http://localhost:4000
ENV API_URL=${API_URL}
ARG NEXT_PUBLIC_TURNSTILE_SITE_KEY
ENV NEXT_PUBLIC_TURNSTILE_SITE_KEY=${NEXT_PUBLIC_TURNSTILE_SITE_KEY}
ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
