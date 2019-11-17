'use strict';

const ParameterStoreLoader = require('./ParameterStoreLoader');
const TokenHandler = require('./TokenHandler');
const RedditApiWrapper = require('./RedditApiWrapper');
const { getRandomResponse } = require('./assets/responses');

const prefix = '/ratedCommentBot/';
const keys = [
    '/ratedCommentBot/clientId',
    '/ratedCommentBot/clientSecret',
    '/ratedCommentBot/username',
    '/ratedCommentBot/password',
    '/ratedCommentBot/blacklistedSubs'
];

module.exports.handler = async function(event, context) {
    let paramStore;
    try {
        paramStore = new ParameterStoreLoader({ region: 'eu-west-1' });
    } catch (error) {
        console.log('>>>> error creating ParameterStoreLoader');
    }
    let tokenHandler;
    let redditApiWrapper;

    console.log('>>>> handler started');
    return paramStore.getParametersFromStore(keys, prefix)
        .then((config) => {
            console.log('>>>> got parameters');
            tokenHandler = new TokenHandler(config);
            return tokenHandler.getAccessToken()
                .then((accessToken) => {
                    const { blacklistedSubs } = config;
                    redditApiWrapper = new RedditApiWrapper({ accessToken, blacklistedSubs });
                });
        })
        .then(() => {
            return redditApiWrapper.searchInComments('underrated comment')
                .then((comments) => {
                    if (comments.length) {
                        const [firstComment] = comments;
                        console.log('Replying to comment:', firstComment);
                        return getRandomResponse()
                            .then((response) => {
                                console.log('Replying with response:', response);
                                return { id: firstComment.id, response };
                            });
                    }
                    throw new Error('No comments to reply to...');
                });
        })
        .then(({ id, response }) => {
            return redditApiWrapper.replyToComment(id, response);
        })
        .then((response) => {
            console.log(response);
            console.log('>>>> handler ended');
        })
        .catch((err) => console.log(err.message));
};
