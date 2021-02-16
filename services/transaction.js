const util = require('util')
const Big = require('big.js');
const { Currency } = require('../valueObjects/currency');
const { UpholdAPI } = require("./upholdAPI");
const logger = require("../logger/logger");

module.exports = {
    async buyBTC(tickData, usdAsset, email) {
        const oldMoney = Big(usdAsset.amount);
        const expenseMoney = oldMoney.minus(20); // Please let me keep 20$

        // If I am rich enough
        if (expenseMoney.toNumber()) {
            const btcAmount = expenseMoney.div(tickData.ask);
            const cost = btcAmount.times(tickData.ask);

            const cardsData = await UpholdAPI.getCards();
            if(cardsData.hasOwnProperty('error')) {
                logger.error(`Could not get CARDS in UPHOLD: ${cardsData}.`);
                return {
                    btcBought: 0,
                    realCost: 0,
                };
            }
            let USDCard = cardsData.filter(card => card.currency === Currency.USD)[0];
            const transaction = await UpholdAPI.createTransaction(USDCard.id, email, btcAmount.toNumber().toString(), Currency.BTC);
            if (transaction.hasOwnProperty('errors')) {
                logger.error(`[Buying] Could not create transaction in UPHOLD:  ${util.inspect(transaction, {showHidden: false, depth: null})}.`);
                return {
                    btcBought: 0,
                    realCost: 0,
                };
            }
            logger.info(`Created transaction for buying BTC in UPHOLD, id: ${transaction.id}.`);
           

            let totalFee = transaction.fees.reduce((acc, currFee) => {
                return acc + Number(currFee.amount);
            }, 0)
            let realCost = Big(totalFee).plus(cost);
            return {
                btcBought: btcAmount.toNumber(),
                realCost: realCost.toNumber(),
            };

        } else {
            logger.error(`You current balance is: ${usdAsset.amount}, which is below the 20$ emergency fund. Your bot needs improvement.`);
            process.exit();
        }
    },
    async sellBTC(tickData, usdAsset, btcAsset, email) {
        const btcAmount = btcAsset.amount;
        const cardsData = await UpholdAPI.getCards();

        let BTCCard = cardsData.filter(card => card.label === "BTC account 3")[0];
        const transaction = await UpholdAPI.createTransaction(BTCCard.id, email, btcAmount, Currency.USD);
        if (transaction.hasOwnProperty('errors')) {
            logger.error(`[Selling] Could not create transaction in UPHOLD: ${util.inspect(transaction, {showHidden: false, depth: null})}.`);
            return {
                btcSold: 0,
                usdIncome: 0,
            };
        }
        logger.info(`Created transaction for selling BTC in UPHOLD, id: ${transaction.id}.`);
        
        let realIncome = Number(transaction.normalized[0].amount);
        return {
            btcSold: transaction.denomination.amount,
            usdIncome: realIncome,
        };


    }
}