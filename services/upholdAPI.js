/**
 * 
 * @UPHOLD API
 * https://uphold.com/en/developer/api/documentation/ 
 * 
 */
const fetch = require('node-fetch');

const Tickers = {
    BTCUSD: "BTC-USD",
}

const UpholdAPI = {
    tick: async (pair = "BTC-USD") => {
        //GET https://api.uphold.com/v0/ticker/:currency
        return await fetch(`https://api.uphold.com/v0/ticker/${pair}`)
            .then(response => response.json())
            .catch((err) => {
                console.error(`Could not tick the uphold API: ${err}`);
            });
        
    }
}

module.exports = { UpholdAPI, Tickers };