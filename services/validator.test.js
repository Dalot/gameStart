const { Tickers } = require("./upholdAPI");
const Validator = require("./validator");

test("tests validations of tickers", async () => {
    expect.assertions(3);
    let ticker = Tickers.BTCUSD;
    expect(true).toEqual(Validator.validateTicker(ticker));
    ticker = 'BTCUSD'; // missing the hiphen
    expect(false).toEqual(Validator.validateTicker(ticker));
    ticker = 'BTC-EUR'; // not implemented
    expect(false).toEqual(Validator.validateTicker(ticker));
});

test("tests validation of tickData object", async () => {
    expect.assertions(5);
    let tickData = {
        ask: '1000.0004',
        bid: '4525.0005',
        currency: 'USD',
    };
    expect(true).toEqual(Validator.validateTickData(tickData));
    tickData = {
        ask: 1000.4444,
        bid: '4525.0005',
        currency: 'USD',
    };
    expect(false).toEqual(Validator.validateTickData(tickData));
    tickData = {
        bid: '4525.0005',
        currency: 'USD',
    };
    expect(false).toEqual(Validator.validateTickData(tickData));
    tickData = {
        ask: '1000.0004',
        bid: '',
        currency: 'USD',
    };
    expect(false).toEqual(Validator.validateTickData(tickData));
    tickData = {
        ask: '1000.0004',
        bid: '1000.0004',
        currency: 'USD',
        hello: 'world',
    };
    expect(true).toEqual(Validator.validateTickData(tickData));
});

test("tests validation of isNumeric function", async () => {
    expect.assertions(8);
    let numeric = '000.444';
    expect(true).toEqual(Validator.isNumeric(numeric));
    numeric = '0';
    expect(true).toEqual(Validator.isNumeric(numeric));
    numeric = '';
    expect(false).toEqual(Validator.isNumeric(numeric));
    numeric = '432hello';
    expect(false).toEqual(Validator.isNumeric(numeric));
    numeric = '324l';
    expect(false).toEqual(Validator.isNumeric(numeric));
    numeric = '324,32';
    expect(false).toEqual(Validator.isNumeric(numeric));
    numeric = 324,32;
    expect(false).toEqual(Validator.isNumeric(numeric));
    numeric = 324.32; // function should only accept strings
    expect(false).toEqual(Validator.isNumeric(numeric));
});

test("tests validation of upholdUser", async () => {
    expect.assertions(4);
    let user = {
        email: "john.doe@domain.com",
        id: "59da72d4-986a-48f1-9ce8-2caee100eeef",
    };
    expect(true).toEqual(Validator.validateUpholdUser(user));
    user = {
        email: "john.doe@domain.",
        id: "59da72d4-986a-48f1-9ce8-2caee100eeef",
    };
    expect(false).toEqual(Validator.validateUpholdUser(user));
    user = {
        email: "john.doe@domain.com",
        id: 523423,
    };
    expect(false).toEqual(Validator.validateUpholdUser(user));
    user = {
        email: "john.doe@domain.com",
    };
    expect(false).toEqual(Validator.validateUpholdUser(user));
});

test("tests validation of upholdAsset", async () => {
    expect.assertions(5);
    let upholdAsset = {
        available: "444.55",
        currencies: {
            USD: {
                amount: "444.555"
            }
        }
    };
    expect(true).toEqual(Validator.validateUpholdAsset(upholdAsset));
    upholdAsset.currencies = {}
    expect(false).toEqual(Validator.validateUpholdAsset(upholdAsset));
    upholdAsset.currencies = {
        USD: {}
    }
    expect(false).toEqual(Validator.validateUpholdAsset(upholdAsset));
    upholdAsset.currencies = {
        USD: {
            amount: ""
        }
    }
    upholdAsset = {
        currencies: {
            USD: {
                amount: "444.555"
            }
        }
    };
    expect(false).toEqual(Validator.validateUpholdAsset(upholdAsset));
    upholdAsset = {
        available: "",
        currencies: {
            USD: {
                amount: "444.555"
            }
        }
    };
    expect(false).toEqual(Validator.validateUpholdAsset(upholdAsset));
    
});