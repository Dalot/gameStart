const transactionRepository = require("../repositories/transaction");
const tickRepository = require("../repositories/tick");
const assetRepository = require("../repositories/asset");
const userRepository = require("../repositories/user");
const transactionService = require("./transaction");
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
        user: {},
        token: {},
    },
    get token()  {
        return this.store.token;
    },
    set token(newToken)  {
        this.store.token = newToken;
    },
    get user()  {
        return this.store.user;
    },
    set user(newObj)  {
        this.store.user = newObj;
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
    get usdAsset() {
        return this.store.usdAsset;
    },
    set usdAsset(newObj)  {
        this.store.usdAsset = newObj;
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
    async createOrUpdateUser(upholdUser) {
        if(!Validator.validateUpholdUser(upholdUser)) {
            logger.error(`Could not validate user from uphold: ${upholdUser}`);
            return null;
        }

        const user = {
            email: upholdUser.email,
            uphold_id: upholdUser.id,
        }
        
        const newUser = await userRepository.createOrUpdate(user)
        this.user = newUser;
        return newUser;
    },
    async createOrUpdateAsset(upholdAsset, userID) {
        if(!Validator.validateUpholdAsset(upholdAsset)) {
            logger.error(`Could not validate asset from uphold: ${upholdAsset}`);
            return null;
        }

        const asset = {
            currency: Currency.USD,
            amount: Number(upholdAsset.available),
            userId: Number(userID)
        };
        return await assetRepository.createOrUpdate(asset);
    },
    async init() {
        // TODO: Make this into one query
        UpholdAPI.token = this.token;
        this.btcAsset = await assetRepository.getBTCAsset(this.user.id);
        this.usdAsset = await assetRepository.getUSDAsset(this.user.id);
        if(!this.btcAsset) {
            this.btcAsset = await assetRepository.create(0, Currency.BTC, this.user.id);
        }
        
        if(!this.usdAsset) {
            const cardsData = await UpholdAPI.getCards();
            if(cardsData.hasOwnProperty('error')) {
                logger.error(`Could not get CARDS in UPHOLD to check my balance: ${cardsData}.`);
                process.exit();
            }
            let USDCard = cardsData.filter(card => card.currency === Currency.USD)[0];
            this.usdAsset = await assetRepository.create(Number(USDCard.available), Currency.USD, this.user.id);
            logger.info(`[Initial Balance] ${Number(USDCard.available)}`)
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
            let boughtBTC = await this.buyBTC();
            logger.info(`[₿₿₿ Buying the initial bitcoin ₿₿₿]`);
            await this.updateBalance(boughtBTC);
            return
        } else {
            this.purchase = this.purchase[0];
        }
        const boughtAmount = Big(this.purchase.amount);
        const boughtCost = Big(this.purchase.cost);
        const bidPrice = Big(Number(this.tickData.bid));
        if (this.shouldSell(boughtAmount, boughtCost, bidPrice)) {
            const soldBtc = await this.sellBTC();
            await this.updateBalance(-soldBtc);
            return
        } else {
            logger.info(`[💰💰 Are we selling? 💰💰] Not selling anything. For a ${PROFIT_MARGIN * 100 - 100}% profit margin we need:`);
            logger.info(`[💰💰 Are we selling? 💰💰]\tCurrent buying price: ${this.tickData.bid}`);
            logger.info(`[💰💰 Are we selling? 💰💰]\tNeeded price ${bidPrice.times(PROFIT_MARGIN).toNumber() }`);

            logger.info(`[₿₿₿ Current bitcoin amount ₿₿₿]\t ${ this.btcAsset.amount }`)
            logger.info(`[💳💳 Current Cash balance 💳💳]\t ${ this.usdAsset.amount }`)
        }
        
        if(this.sale.length !== 0) {
            this.sale = this.sale[0]
            if (this.sale) {

                const soldAmount = Big(this.sale.amount);
                const soldCost = Big(this.sale.cost);
                const askPrice = Big(Number(this.tickData.ask));
                if (this.shouldBuy(soldAmount, soldCost, askPrice)) {
                    await this.buyBTC();
                    await this.updateBalance(1);
                    return
                } else {
                    logger.info(`[🛒🛒 Are we buying? 🛒🛒] Not buying anything. For a ${PROFIT_MARGIN * 100 - 100}% profit margin we need:`);
                    logger.info(`[🛒🛒 Are we buying? 🛒🛒]\tCurrent selling price: ${this.tickData.ask}`);
                    logger.info(`[🛒🛒 Are we buying? 🛒🛒]\tNeeded price ${soldPrice.times(PROFIT_MARGIN).toNumber() }`);
                }
            }
        }


    },
    async updateBalance(amount) {
        const btcAsset = await assetRepository.getBTCAsset(this.user.id);
        const before = Big(btcAsset.amount);
        const now = before.plus(amount);
        await assetRepository.update(this.btcAsset.id, { amount: now.toNumber() });
    },
    shouldSell(boughtAmount, boughtCost, bidPrice) {
        return bidPrice.times(boughtAmount).gt(boughtCost.times(PROFIT_MARGIN)) && this.btcAsset.amount > 0;
    },
    shouldBuy(soldAmount, soldCost, askPrice) {
        return askPrice.times(soldAmount).lt(soldCost.times(PROFIT_MARGIN));
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
            logger.info(`[📈📈 Tick entry 📈📈] BID: ${result.bid}, ASK: ${result.ask}`);
        })
    
        return tickData;
    },
    async buyBTC() {
        let btcBought = 0;
        let realCost = 0;
        await transactionService.buyBTC(this.tickData, this.usdAsset, this.user.email).then(result => {
            btcBought = result.btcBought;
            realCost = result.realCost;
            transactionRepository.buy(Currency.BTC, btcBought, realCost).then(() => {
                logger.info(`[🛒🛒 BOUGHT BITCOIN 🛒🛒] Amount: ${btcBought} Cost(btc + fees): ${realCost}. BTC Price: ${this.tickData.ask}`);
            }).then(async () => {
                const currentMoney = Big(this.usdAsset.amount).minus(realCost).toNumber();
                
                const newAsset = await assetRepository.update(this.usdAsset.id, { amount: currentMoney});
                logger.info(`[🧾🧾Current Balance🧾🧾] ${currentMoney} (-${realCost})`);
                this.usdAsset = newAsset;
            });
        });

        return btcBought;
    },
    async sellBTC() {
        let btcSold = 0;
        let usdIncome = 0;

        await transactionService.sellBTC(this.tickData, this.usdAsset, this.btcAsset, this.user.email).then(result => {
            btcSold = result.btcSold;
            usdIncome = result.usdIncome;

            transactionRepository.sell(Currency.BTC, btcSold, usdIncome).then((result) => {
                logger.info(`[💰💰 SOLD BITCOIN 💰💰] INCOME: ${result.cost}`);
            }).then(async () => {
                const oldMoney = Big(this.usdAsset.amount);
                const currentMoney = oldMoney.plus(usdIncome).toNumber();
                
                
                await assetRepository.update(this.usdAsset.id, currentMoney).then(() => {
                    logger.info(`You current balance: ${currentMoney} (+${usdIncome})`);
                })
            })
        });

        return btcSold;
    }
}




