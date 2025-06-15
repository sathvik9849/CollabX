FROM node:18

RUN export NODE_ENV=production
RUN mkdir -p /usr/src

WORKDIR /usr/src/

COPY package.json package-lock.json ./
RUN npm install

COPY backend backend
COPY frontend frontend

EXPOSE 3000

CMD ["/bin/bash", "-c","npm start"]