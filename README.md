# Bot
A showcase bitcoin bot.

## Install
Follow these step to run locally or simply run with docker compose.

### Locally with DB container
```sh 
docker run --name postgresql -p 5432:5432 -e POSTGRES_USER=user -e POSTGRES_PASSWORD=secret -d postgres
```
```sh
npm i
cp .env.example .env 
```
Fill the following details for the sandbox environemnt: CLIENT_ID, CLIENT_SECRET, UPHOLD_ACC_EMAIL 
npm test # sqlite:memory
```sh
node index.js
```

### Docker
```sh
cp .env.example .env 
```
Fill the following details for the sandbox environemnt: CLIENT_ID, CLIENT_SECRET, UPHOLD_ACC_EMAIL 
npm test # sqlite:memory
```sh
docker-compose up
```