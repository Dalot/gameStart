FROM node:14.15.5-alpine3.13
RUN mkdir -p /opt/bot
WORKDIR /opt/bot
RUN adduser -D bot
COPY ./ .
RUN npm install --only=prod
RUN chown -R bot:bot /opt/bot
USER bot
CMD [ "node", "index.js"]