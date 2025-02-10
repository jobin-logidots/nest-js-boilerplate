FROM node:18.20.6-alpine

RUN npm i -g maildev@2.0.5

CMD maildev
