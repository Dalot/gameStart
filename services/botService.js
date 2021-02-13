const db = require('../database/database');
const {TransactionType} = require('../models/transaction');
const Big = require('big.js');

const PROFIT_MARGIN = 1.05;

module.exports.Validator = () => {
    mustBuy: async () => {
        // TODO: Make this into one query 
        let purchase = await db.transactions.latest(TransactionType.BUY);
        let sale = await db.transactions.latest(TransactionType.SELL)        
        const tickData = await UpholdAPI.tick("BTC-USD");
        tickRepository.create(tickData.bid, tickData.ask).then((result) => {
            logger.info(`created tick entry, bid: ${result.bid}, ask: ${result.ask}`);
        })

        if (purchase.length === 0 || sale.length === 0) {
            return true;
        }

        const boughtPrice = Big(purchase.price);
        const askPrice = Big(Number(tickData.ask));

        // We are infinitely rich, so we can buy forever.
        return boughtPrice.times(PROFIT_MARGIN).gt(askPrice);
    }
}