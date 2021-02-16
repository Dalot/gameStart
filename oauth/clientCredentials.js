/**
 * Dependencies.
 */

const axios = require("axios");
const dotenv = require("dotenv");
const path = require("path");

// Dotenv configuration.
dotenv.config({ path: path.resolve() + "/.env" });

// Authentication credentials.
const auth = Buffer.from(process.env.CLIENT_ID + ":" + process.env.CLIENT_SECRET).toString("base64");

/**
 * Format API error response for printing in console.
 */

function formatError(error) {
    const responseStatus = `${error.response.status} (${error.response.statusText})`;

    console.log(
        `Request failed with HTTP status code ${responseStatus}`,
        JSON.stringify({
            url: error.config.url,
            response: error.response.data
        }, null, 2)
    );

    throw error;
}

module.exports =  {
    /**
     * Get a new access token, using client credentials authentication (client ID and secret).
     */

    async getAccessToken() {
        try {
            const response = await axios.request({
                method: "POST",
                url: `${process.env.BASE_URL}/oauth2/token`,
                data: "grant_type=client_credentials",
                headers: {
                    Authorization: `Basic ${auth}`,
                    "content-type": "application/x-www-form-urlencoded",
                },
            });

            return response.data;
        } catch (error) {
            formatError(error);
        }
    },

    /**
     * Get data about the currently authenticated user.
     */

    async getUserInfo(accessToken) {
        try {
            const response = await axios.request({
                method: "GET",
                url: `${process.env.BASE_URL}/v0/me`,
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            return response.data;
        } catch (error) {
            formatError(error);
        }
    }
};
