FROM node:alpine3.12 as base
RUN mkdir /srv/ia-2-017-0-lodge-broker
WORKDIR /srv/ia-2-017-0-lodge-broker
ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait
COPY package.json package-lock.json /srv/ia-2-017-0-lodge-broker/
RUN npm ci

FROM base as test
COPY tsconfig.json .eslintrc.js .prettierrc.js api_test.postman_collection.json /srv/ia-2-017-0-lodge-broker/
CMD npm run tsc && npm run lint && npm run prettier && /wait && npm run newman

FROM base
COPY tsconfig.json /srv/ia-2-017-0-lodge-broker/
CMD /wait && npm start
