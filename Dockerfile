FROM node:lts

WORKDIR /app

COPY package.json package-lock.json ./

RUN npm ci --no-audit --no-fund --progress=false --ignore-scripts

COPY . .

ENV NODE_OPTIONS="--max-old-space-size=4096"

RUN npm run build

EXPOSE 3000

CMD [ "npm", "start" ]
