FROM node:16.20.2

WORKDIR /app/BACK

COPY ./backend .

RUN npm install

RUN npx prisma generate
RUN npm run build

# RUN npm uninstall bcrypt
# RUN npm i bcrypt
COPY ./deployment/back/init.sh .

EXPOSE 9000
CMD ["sh", "init.sh"]
