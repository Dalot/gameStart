# Bot
A showcase bitcoin bot.

## Install
Follow the steps below to run locally or simply run [docker compose](#docker).

### Locally with DB container
```sh 
git clone https://github.com/Dalot/gameStart
cd gameStart
npm i
cp .env.example .env 
```
Fill the following details for the sandbox environemnt: `CLIENT_ID`, `CLIENT_SECRET`, `UPHOLD_ACC_EMAIL`. 

Then you can run tests (sqlite:memory).
```sh
npm test 
```

And before runnign the bot, create the db:
```sh
docker run --name postgresql -p 5432:5432 -e POSTGRES_USER=user -e POSTGRES_PASSWORD=secret -d postgres
node index.js
```

### Docker
```sh
cp .env.example .env 
```
Fill the following details for the sandbox environemnt: `CLIENT_ID`, `CLIENT_SECRET`, `UPHOLD_ACC_EMAIL`. 

```sh
docker-compose up
```
