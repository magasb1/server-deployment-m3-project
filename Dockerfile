FROM node:18-alpine

ARG NODE_ENV=production
WORKDIR /app

COPY package*.json .
RUN npm install

COPY . .

CMD ["node", "src/app.js"]