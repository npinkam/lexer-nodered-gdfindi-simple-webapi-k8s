FROM node:13-alpine
WORKDIR /app
RUN mkdir -p /app/userDir
RUN apk add --no-cache git
COPY package.json package-lock.json ./
RUN npm install --production
COPY . .
EXPOSE 8000
CMD node index.js