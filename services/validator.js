const { Tickers } = require("./upholdAPI");
const { Currency } = require('../valueObjects/currency');


module.exports = {
    validateTicker: (ticker) => {
        for (const [key, value] of Object.entries(Tickers)) {
            if (ticker === value) {
                return true;
            }
        }

        return false;
    },

    validateTickData: function(tickData) {
        let hasProperties = tickData.hasOwnProperty('ask') && tickData.hasOwnProperty('bid') && tickData.hasOwnProperty('currency');
        
        if (hasProperties) {
            if (!this.isNumeric(tickData.bid) || !this.isNumeric(tickData.ask)) return false;
            if (tickData.currency !== Currency.USD) return false;
        } else {
            return false
        }

        return true;
    },
    isNumeric: (str) => {
        if (typeof str != "string") return false
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    }
}