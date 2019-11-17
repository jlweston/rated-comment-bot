'use strict';

const got = require('got');
const Promise = require('bluebird');
const qs = require('qs');
const _ = require('underscore');

class RedditApiWrapper {
    constructor(options) {
        console.log('>>>> created RedditApiWrapper');
        this.accessToken = options.accessToken;
        this.blacklistedSubs = options.blacklistedSubs;
    }

    getOwnProfile() {
        return getOwnProfileImpl(this);
    }

    getUserProfile(username) {
        return getUserProfileImpl(this, username);
    }

    getSubreddit(sub) {
        return getSubredditImpl(this, sub);
    }

    searchInComments(query, sub) {
        return searchInCommentsImpl(this, query, sub);
    }

    getCommentChildren(articleId, commentId) {
        return getCommentChildrenImpl(this, articleId, commentId);
    }

    hasReplies(commentId) {
        return hasRepliesImpl(this, commentId);
    }

    replyToComment(commentId, response) {
        return replyToCommentImpl(this, commentId, response);
    }
}

const getOwnProfileImpl = Promise.method((self) => {
    return got.get('https://oauth.reddit.com/api/v1/me', {
        headers: {
            Authorization: `Bearer ${self.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'RatedCommentBot'
        },
        withCredentials: true
    })
        .then(({ statusCode, statusMessage, body }) => {
            if (statusCode === 200 && statusMessage === 'OK') {
                return JSON.parse(body);
            }
            throw new Error('There was a problem retrieving your profile');
        });
});

const getUserProfileImpl = Promise.method((self, userId) => {
    return got.get(`https://oauth.reddit.com/user/${userId}/about`, {
        headers: {
            Authorization: `Bearer ${self.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'RatedCommentBot'
        },
        withCredentials: true
    })
        .then(({ statusCode, statusMessage, body }) => {
            if (statusCode === 200 && statusMessage === 'OK') {
                return JSON.parse(body);
            }
            throw new Error('There was a problem retrieving the user profile');
        });
});

const getSubredditImpl = Promise.method((self, subreddit) => {
    return got.get(`https://oauth.reddit.com/r/${subreddit}/about`, {
        headers: {
            Authorization: `Bearer ${self.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'RatedCommentBot'
        },
        withCredentials: true
    })
        .then(({ statusCode, statusMessage, body }) => {
            if (statusCode === 200 && statusMessage === 'OK') {
                return JSON.parse(body);
            }
            throw new Error('There was a problem retrieving subreddit details');
        });
});

// Searches using pushshift as reddit's native API doesn't support
// easy searching of comments. Returns comments from the last hour
// (55 minutes to ensure no overlap with cron job) where 'body'
// includes 'query'. If 'sub' is provided, limits the search to this sub.
const searchInCommentsImpl = Promise.method((self, query, sub) => {
    console.log('>>>> searchInCommentsImpl started');
    const url = sub ? `https://api.pushshift.io/reddit/search/comment/?subreddit=${sub}&` : 'https://api.pushshift.io/reddit/search?';
    return got.get(`${url}q="${query}"&after=55m`, {
        headers: {
            Authorization: `Bearer ${self.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'RatedCommentBot'
        },
        withCredentials: true
    })
        .then(({ statusCode, statusMessage, body }) => {
            if (statusCode === 200 && statusMessage === 'OK') {
                const parsedBody = JSON.parse(body);
                return mapComments(self, parsedBody.data)
                    .then((comments) => filterBlacklistedSubs(self, comments))
                    .then((comments) => sortCommentsByScore(self, comments));
                // .then((comments) => filterPositiveScores(self, comments));
            }
            throw new Error('There was a problem retrieving comments');
        });
});

const getCommentChildrenImpl = Promise.method((self, articleId, commentId) => {
    return got.get(`https://oauth.reddit.com/api/info?id=${commentId}`, {
        headers: {
            Authorization: `Bearer ${self.accessToken}`,
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'RatedCommentBot'
        }
    })
        .then(({ statusCode, statusMessage, body }) => {
            if (statusCode === 200 && statusMessage === 'OK') {
                const parsedBody = JSON.parse(body);
                return parsedBody.data.children;
            }
            throw new Error('There was a problem retrieving child comments');
        });
});

// TODO figure out how to accurately determine if a comment has replies
//  so we can ensure we don't reply twice.
const hasRepliesImpl = Promise.method((self, commentId) => {
    return got.get(`https://oauth.reddit.com/api/info?id=${commentId}`,
        {
            headers: {
                Authorization: `Bearer ${self.accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'RatedCommentBot'
            }
        })
        .then(({ statusCode, statusMessage, body }) => {
            if (statusCode === 200 && statusMessage === 'OK') {
                const parsedBody = JSON.parse(body);
                return parsedBody.data.children;
            }
            throw new Error('There was a problem retrieving replies');
        })
        .catch(console.log);
});

const replyToCommentImpl = Promise.method((self, commentId, response) => {
    return got.post('https://oauth.reddit.com/api/comment',
        {
            headers: {
                Authorization: `Bearer ${self.accessToken}`,
                'Content-Type': 'application/x-www-form-urlencoded',
                'User-Agent': 'RatedCommentBot'
            },
            body: qs.stringify({
                thing_id: commentId,
                text: response
            })
        })
        .then(({ statusCode, statusMessage, body }) => {
            if (statusCode === 200 && statusMessage === 'OK') {
                const parsedBody = JSON.parse(body);
                return parsedBody.success;
            }
            throw new Error('There was a problem submitting your reply');
        });
});

// Utility functions

const mapComments = Promise.method((self, comments) => {
    const items = [];
    for (let i = 0; i < comments.length; i++) {
        const c = comments[i];
        const item = {
            id: `t1_${c.id}`,
            parentId: c.parent_id,
            author: c.author,
            subreddit: c.subreddit,
            score: c.score
        };
        items.push(item);
    }
    return items;
});

const filterBlacklistedSubs = Promise.method((self, comments) => {
    return _.filter(comments, (comment) => !_.contains(self.blacklistedSubs, comment.subreddit));
});

const sortCommentsByScore = Promise.method((self, comments) => {
    return _.sortBy(comments, 'score');
});

const filterPositiveScores = Promise.method((self, comments) => {
    return _.filter(comments, (comment) => comment.score < 0);
});

module.exports = RedditApiWrapper;
