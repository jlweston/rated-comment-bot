'use strict';

const btoa = require('btoa');
const got = require('got');
const qs = require('querystring');

class TokenHandler {
    constructor(config) {
        console.log('>>>> created TokenHandler');
        this.clientId = config.clientId;
        this.clientSecret = config.clientSecret;
        this.username = config.username;
        this.password = config.password;
    }

    getAccessToken(...args) {
        return getAccessTokenImpl(this, args);
    }
}

const getAccessTokenImpl = (self) => {
    console.log('>>>> getAccessTokenImpl started');
    const requestData = {
        grant_type: 'password',
        username: self.username,
        password: self.password
    };

    return got.post('https://www.reddit.com/api/v1/access_token', {
        body: qs.encode(requestData),
        headers: {
            Authorization: `Basic ${btoa(`${self.clientId}:${self.clientSecret}`)}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'RatedCommentBot'
        },
        withCredentials: true
    })
        .then(({ statusCode, statusMessage, body }) => {
            if (statusCode === 200 && statusMessage === 'OK') {
                const parsedBody = JSON.parse(body);
                return parsedBody.access_token;
            }
            throw new Error('There was a problem retrieving the access token');
        })
        .catch((err) => {
            console.log(err);
            throw new Error('There was a problem retrieving the access token');
        });
};

module.exports = TokenHandler;
