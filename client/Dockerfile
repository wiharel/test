FROM node:lts
WORKDIR /client
COPY package*.json .
COPY . .
RUN npm install

CMD ["npm", "start"]