const db = require('../database/database');
const transactionRepository = require("../repositories/transaction");
const tickRepository = require("../repositories/tick");
const assetRepository = require("../repositories/asset");
const { TransactionType } = require('../models/transaction');
const { Currency } = require('../valueObjects/currency');
const Big = require('big.js');

const PROFIT_MARGIN = 1.05;
const { UpholdAPI }  = require("./upholdAPI");
const Validator = require("./validator");
const logger = require('../logger/logger');


module.exports = {
    store: {
        tickData: {},
        btcAsset: {},
        purchase: {},
        sale: {},
    },
    get tickData()  {
        return this.store.tickData;
    },
    set tickData(newObj)  {
        this.store.tickData = newObj;
    },
    get btcAsset() {
        return this.store.btcAsset;
    },
    set btcAsset(newObj)  {
        this.store.btcAsset = newObj;
    },
    get purchase()  {
        return this.store.purchase;
    },
    set purchase(newObj)  {
        this.store.purchase = newObj;
    },
    get sale()  {
        return this.store.sale;
    },
    set sale(newObj) {
        this.store.sale = newObj;
    },
    async evaluate() {
        await this.init();
        await this.nextMove();
    },
    async init() {
        // TODO: Make this into one query 
        this.btcAsset = await assetRepository.getBTCAsset();
        if(!this.btcAsset) {
            this.btcAsset = await assetRepository.create(0, Currency.BTC);
        }
        this.tickData = await this.tickUphold("BTC-USD");
    
        if (!this.tickData) {
            return;
        }
    },
    async nextMove() {
        this.purchase = await transactionRepository.latest(TransactionType.BUY);
        this.sale = await transactionRepository.latest(TransactionType.SELL);

        if (this.purchase.length === 0) {
            await this.buyBTC();
            await this.updateBalance(1);
            return
        } else {
            this.purchase = this.purchase[0];
        }

        const boughtPrice = Big(this.purchase.price);
        const bidPrice = Big(Number(this.tickData.bid));
        if (this.shouldSell(boughtPrice, bidPrice)) {
            await this.sellBTC();
            await this.updateBalance(0);
            return
        }
        
        if(this.sale.length !== 0) {
            this.sale = this.sale[0]
        }

        const soldPrice = Big(this.sale.price);
        const askPrice = Big(Number(this.tickData.ask));
        
        if (this.shouldBuy(soldPrice, askPrice)) {
            await this.buyBTC();
            await this.updateBalance(1);
            return
        }

    },
    async updateBalance(amount) {
        await assetRepository.update(this.btcAsset.id, { amount });
    },
    shouldSell(boughtPrice, bidPrice) {
        return bidPrice.gt(boughtPrice.times(PROFIT_MARGIN)) && this.btcAsset.amount === 1;
    },
    shouldBuy(soldPrice, askPrice) {
        return askPrice.lt(soldPrice.times(PROFIT_MARGIN)) && this.btcAsset.amount === 0;
    },
    async tickUphold(ticker) {
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
    },
    async buyBTC() {
        transactionRepository.buy(Currency.BTC, Currency.USD, this.tickData.ask).then((result) => {
            logger.info(`created transaction entry to BUY BTC for the price: ${result.price}`);
        })
    },
    async sellBTC() {
        transactionRepository.sell(Currency.BTC, Currency.USD, this.tickData.bid).then((result) => {
            logger.info(`created transaction entry to SELL BTC for the price: ${result.price}`);
        });
    }
}




