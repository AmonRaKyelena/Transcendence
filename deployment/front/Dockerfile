FROM node:16.20.2

WORKDIR /app/FRONT

EXPOSE 3000

COPY ./frontend .

RUN yarn install

RUN yarn build

CMD ["yarn", "dev"]
