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
    validateUpholdUser: function(upholdUser) {
        let hasProperties = upholdUser.hasOwnProperty('email') && upholdUser.hasOwnProperty('id');
        
        if (hasProperties) {
            if ((typeof upholdUser.email) !== "string" || (typeof upholdUser.id) !== "string") return false;
            if (!this.validateEmail(upholdUser.email)) return false;
        } else {
            return false
        }

        return true;
    },
    validateUpholdAsset: function(upholdAsset) {
        let hasProperties = upholdAsset.hasOwnProperty('available') && upholdAsset.hasOwnProperty('currencies');
        
        if (hasProperties) {
            if (!upholdAsset.currencies.hasOwnProperty(Currency.USD) || !upholdAsset.currencies[Currency.USD].hasOwnProperty('amount'))
                return false;
            
            if(!this.isNumeric(upholdAsset.currencies[Currency.USD].amount)) 
                return false;

            if(!this.isNumeric(upholdAsset.available)) 
                return false;
          
        } else {
            return false
        }

        return true;
    },
    isNumeric: (str) => {
        if (typeof str != "string") return false
        return !isNaN(str) && // use type coercion to parse the _entirety_ of the string (`parseFloat` alone does not do this)...
            !isNaN(parseFloat(str)) // ...and ensure strings of whitespace fail
    },
    validateEmail(email) {
        const re = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }
}