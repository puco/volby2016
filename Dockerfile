FROM mhart/alpine-node:5

ADD . .

RUN npm install

EXPOSE 3000
CMD ["node", "index.js"]
