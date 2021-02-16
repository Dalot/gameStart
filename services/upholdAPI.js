/**
 * 
 * @UPHOLD API
 * https://uphold.com/en/developer/api/documentation/ 
 * 
 */
const fetch = require('node-fetch');
const logger = require("../logger/logger");

const Tickers = {
    BTCUSD: "BTC-USD",
}

const UpholdAPI = {
    store: {
        token: "",
    },
    get token() {
        return this.store.token;
    },
    set token(token) {
        this.store.token = token;
    },
    tick: async (pair = "BTC-USD") => {
        //GET https://api.uphold.com/v0/ticker/:currency
        return await fetch(`https://api-sandbox.uphold.com/v0/ticker/${pair}`)
            .then(response => response.json())
            .catch((err) => {
                console.error(`Could not tick the uphold API: ${err}`);
            });

    },
    /*buyBtc: async (btcAmount, cardId) => {
        return await fetch(`https://api-sandbox.uphold.com/v0/me/cards/${}/transactions`)
            .then(response => response.json())
            .catch((err) => {
                console.error(`Could not tick the uphold API: ${err}`);
            });
    },*/
    getCards: async function () {
        return await fetch(`https://api-sandbox.uphold.com/v0/me/cards`,
            {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': "application/json",
                }
            })
            .then(response => response.json())
            .catch((err) => {
                logger.error(`Could not get cards from the uphold API: ${err}`);
                return
            });
    },
    createTransaction: async function (fromCardId, destinationUserEmail, amount, currency, commit = false) {
        let url = `https://api-sandbox.uphold.com/v0/me/cards/${fromCardId}/transactions`;
        if (commit) {
            url = url + "?commit=true";
        }
        return await fetch(url,
            {
                method: 'POST',
                body: JSON.stringify({
                    denomination: {
                        amount: amount,
                        currency: currency
                    },
                    destination: destinationUserEmail
                }),
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Content-Type': "application/json",
                }
            })
            .then(response => response.json())
            .catch((err) => {
                logger.error(`Could not get cards from the uphold API: ${err}`);
                return
            });
    },
    createTransactionAndCommit: async function (fromCardId, destinationUserEmail, amount, currency) {
        return await this.createTransaction(fromCardId, destinationUserEmail, amount, currency, true)
    },
    buildAuthorization: () => {
        // TODO:
    }
}

module.exports = { UpholdAPI, Tickers };