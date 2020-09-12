FROM node:14.10.1

RUN mkdir /srv/ia-2-017-0-lodge-broker
WORKDIR /srv/ia-2-017-0-lodge-broker

ADD https://github.com/ufoscout/docker-compose-wait/releases/download/2.2.1/wait /wait
RUN chmod +x /wait

ADD package.json /srv/ia-2-017-0-lodge-broker/
RUN npm install

CMD /wait && npm start
