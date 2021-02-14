const { UpholdAPI, Tickers } = require("./upholdAPI");

test("Fetches USD-BTC ticker from API and returns an object with ask, bid and currency properties", async () => {
    expect.assertions(1);
    const tickData = await UpholdAPI.tick("BTC-USD");

    expect(tickData).toEqual(expect.objectContaining(
        {
            ask: expect.any(String),
            bid: expect.any(String),
            currency: expect.any(String),
        }
    ));
});

test("Fetches unknown ticker from API and returns an object with code and message properties", async () => {
    expect.assertions(1);
    const tickData = await UpholdAPI.tick("John Doe");

    expect(tickData).toEqual(expect.objectContaining(
        {
            code: expect.any(String),
            message: expect.any(String),
        }
    ));
});

