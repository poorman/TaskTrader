FROM node:20-alpine
WORKDIR /app

# better-sqlite3 needs build tools
RUN apk add --no-cache python3 make g++

COPY package.json package-lock.json* ./
RUN npm install --production

COPY server.js .

RUN mkdir -p /app/data

EXPOSE 2031
CMD ["node", "server.js"]
