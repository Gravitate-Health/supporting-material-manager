FROM node:22-slim 

ENV APP_PORT=3000

USER root

WORKDIR /usr/src/app
COPY --chown=node package*.json ./
RUN npm install

COPY ./src .

EXPOSE ${APP_PORT}

CMD ["node", "index.js" ]