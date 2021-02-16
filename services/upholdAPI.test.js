const { UpholdAPI } = require("./upholdAPI");
const clientCredentials = require("../oauth/clientCredentials");
const { expect } = require("@jest/globals");
const { Currency } = require("../valueObjects/currency");

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

test("Fetches cards from the API", async () => {
    expect.assertions(2);
    let token = await clientCredentials.getAccessToken();
    UpholdAPI.token = token.access_token;
    const cardsData = await UpholdAPI.getCards();
    
    let BTCCards = cardsData.filter(card => card.currency === Currency.BTC);
    expect(BTCCards[0]).toEqual(expect.objectContaining(
        {
            available: expect.any(String),
            balance: expect.any(String),
            id: expect.any(String),
        }
    ));
    let USDCards = cardsData.filter((card) => {
        return card.currency === Currency.USD;
    })
    expect(USDCards[0]).toEqual(expect.objectContaining(
        {
            available: expect.any(String),
            balance: expect.any(String),
            id: expect.any(String),
        }
    ));

    
});

test("Create a transaction from the API and delete it", async () => {
    expect.assertions(2);
    let token = await clientCredentials.getAccessToken();
    UpholdAPI.token = token.access_token;
    let user = await clientCredentials.getUserInfo(token.access_token);
    expect(user).toEqual(expect.objectContaining(
        {
            email: expect.any(String),
            id: expect.any(String),
        }
    ));
    const cardsData = await UpholdAPI.getCards();
    let USDCard = cardsData.filter(card => card.currency === Currency.USD)[0];

    let transaction = await UpholdAPI.createTransaction(USDCard.id, user.email, "0.00001", Currency.BTC);
    expect(transaction).toEqual(expect.objectContaining(
        {
            denomination: expect.any(Object),
            destination: expect.any(Object),
            origin: expect.any(Object),
            id: expect.any(String),
            status: "pending",
        }
    ));


});

