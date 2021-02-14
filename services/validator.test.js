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