const db = require('../database/database');
const transactionRepository = require("../repositories/transaction");
const tickRepository = require("../repositories/tick");
const assetRepository = require("../repositories/asset");
const { TransactionType } = require('../models/transaction');
const { Currency } = require('../valueObjects/currency');
const Big = require('big.js');

const PROFIT_MARGIN = 1.05;
const { UpholdAPI, Tickers } = require("./upholdAPI");
const logger = require('../logger/logger');


module.exports = {
    store: {
        tickData: {},
        btcAsset: {},
        purchase: {},
    },
    getTickData: function()  {
        return this.store.tickData;
    },
    setTickData: function(newObj)  {
        this.store.tickData = newObj;
    },
    getBtcAsset: function()  {
        return this.store.btcAsset;
    },
    setBtcAsset: function(newObj)  {
        this.store.btcAsset = newObj;
    },
    getPurchase: function()  {
        return this.store.purchase;
    },
    setPurchase: function(newObj)  {
        this.store.purchase = newObj;
    },
    evaluate: async function()  {
        await this.init();
        await this.nextMove();
    },
    init: async function() {
        // TODO: Make this into one query 
        let btcAsset = await assetRepository.getBTCAsset();
        if(!btcAsset) {
            btcAsset = await assetRepository.create(0, Currency.BTC);
        }
        this.setBtcAsset(btcAsset);
        this.setTickData()
        const tickData = await tickUphold("BTC-USD");
    
        if (!tickData) {
            return;
        }
        this.setTickData(tickData);
    },
    nextMove: async function()  {
        let purchase = await transactionRepository.latest(TransactionType.BUY);
        let sale = await transactionRepository.latest(TransactionType.SELL);
        tickData = this.getTickData();
        btcAsset = this.getBtcAsset();

        if (purchase.length === 0) {
            buyBTC(tickData);
            this.updateBalance(btcAsset, 1);
            return
        } else {
            purchase = purchase[0];
        }

        this.setPurchase(purchase);

        const boughtPrice = Big(purchase.price);
        const bidPrice = Big(Number(tickData.bid));
        if (this.shouldSell(boughtPrice, bidPrice)) {
            sellBTC(tickData);
            this.updateBalance(btcAsset, 0);
            return
        }
        
        if(sale.length !== 0) {
            sale = sale[0]
            const soldPrice = Big(sale.price);
            const askPrice = Big(Number(tickData.ask));
            if (this.shouldBuy(soldPrice, askPrice)) {
                buyBTC(tickData);
                this.updateBalance(btcAsset, 1);
                return
            }
        }

    },
    updateBalance: (btcAsset, amount) => {
        assetRepository.update(btcAsset.id, { amount });
    },
    shouldSell: (boughtPrice, bidPrice) => {
        return bidPrice.gt(boughtPrice.times(PROFIT_MARGIN));
    },
    shouldBuy: (soldPrice, askPrice) => {
        return askPrice.lt(soldPrice.times(PROFIT_MARGIN));
    }
}


const tickUphold = async (ticker) => {
    if (!Validator.validateTicker(ticker)) {
        logger.error(`Could not find such ticker: ${ticker}`);
        return null;
    }
    const tickData = await UpholdAPI.tick();

    if (!Validator.validateTickData(tickData)) {
        logger.error(`Could not validate tickData:`, tickData);
        return null;
    }

    await tickRepository.create(tickData.bid, tickData.ask).then((result) => {
        logger.info(`Created tick entry, bid: ${result.bid}, ask: ${result.ask}`);
    })

    return tickData;
}

const buyBTC = async (tickData) => {
    transactionRepository.buy(Currency.BTC, Currency.USD, tickData.ask).then((result) => {
        logger.info(`created transaction entry to BUY BTC for the price: ${result.price}`);
    })
}
const sellBTC = async (tickData) => {
    transactionRepository.sell(Currency.BTC, Currency.USD, tickData.bid).then((result) => {
        logger.info(`created transaction entry to SELL BTC for the price: ${result.price}`);
    });
}

const Validator = {
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

