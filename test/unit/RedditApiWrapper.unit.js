const sandbox = require('sinon').createSandbox();
const got = require('got');// eslint-disable-line no-unused-vars
const RedditApiWrapper = require('../../src/RedditApiWrapper');

describe('RedditApiWrapper', () => {
    let handler;
    let options;

    beforeEach(() => {
        options = {
            accessToken: 'bob'
        };

        handler = new RedditApiWrapper(options);
    });

    afterEach(() => {
        sandbox.restore();
    });

    it('should create an instance of RedditApiWrapper', (done) => {
        try {
            handler.should.be.an.instanceof(RedditApiWrapper);

            done();
        } catch (err) {
            done(err instanceof Error ? err : new Error());
        }
    });

    it('should assign properties', (done) => {
        try {
            handler.accessToken.should.eql(options.accessToken);

            done();
        } catch (err) {
            done(err instanceof Error ? err : new Error(err));
        }
    });

    describe('getOwnProfile', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should throw an error when reddit returns a non-200', (done) => {
            const badRequestResponse = {
                statusCode: 401,
                statusMessage: 'Unauthorized'
            };

            sandbox.stub(got, 'get').resolves(badRequestResponse);

            handler.getOwnProfile()
                .then(() => {
                    done(new Error('should have thrown'));
                })
                .catch((err) => {
                    err.should.be.Error();
                    err.message.should.be.equal('There was a problem retrieving your profile');
                    done();
                });
        });

        it('should return profile details when reddit returns a 200', (done) => {
            const profileResponse = {
                statusCode: 200,
                statusMessage: 'OK',
                body: JSON.stringify({
                    username: 'bob',
                    realname: 'Frank'
                })
            };

            sandbox.stub(got, 'get').resolves(profileResponse);

            handler.getOwnProfile()
                .then((response) => {
                    response.username.should.equal('bob');
                    done();
                })
                .catch(() => {
                    done(new Error('should have thrown'));
                });
        });
    });

    describe('getUserProfile', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should throw an error when reddit returns a non-200', (done) => {
            const badRequestResponse = {
                statusCode: 401,
                statusMessage: 'Unauthorized'
            };

            sandbox.stub(got, 'get').resolves(badRequestResponse);

            handler.getUserProfile()
                .then(() => {
                    done(new Error('should have thrown'));
                })
                .catch((err) => {
                    err.should.be.Error();
                    err.message.should.be.equal('There was a problem retrieving the user profile');
                    done();
                });
        });

        it('should return profile details when reddit returns a 200', (done) => {
            const profileResponse = {
                statusCode: 200,
                statusMessage: 'OK',
                body: JSON.stringify({
                    username: 'bob',
                    realname: 'Frank'
                })
            };

            sandbox.stub(got, 'get').resolves(profileResponse);

            handler.getOwnProfile()
                .then((response) => {
                    response.username.should.equal('bob');
                    done();
                })
                .catch(() => {
                    throw new Error();
                });
        });
    });

    describe('getSubreddit', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should throw an error when reddit returns a non-200', (done) => {
            const badRequestResponse = {
                statusCode: 401,
                statusMessage: 'Unauthorized'
            };

            sandbox.stub(got, 'get').resolves(badRequestResponse);

            handler.getSubreddit('EDH')
                .then(() => {
                    done(new Error('should have thrown'));
                })
                .catch((err) => {
                    err.should.be.Error();
                    err.message.should.be.equal('There was a problem retrieving subreddit details');
                    done();
                });
        });

        it('should return subreddit details when reddit returns a 200', (done) => {
            const profileResponse = {
                statusCode: 200,
                statusMessage: 'OK',
                body: JSON.stringify({
                    kind: 't5',
                    data: {
                        title: 'Elder Dragon Highlander',
                        subscribers: 94350,
                        name: 't5_2scee'
                    }
                })
            };

            sandbox.stub(got, 'get').resolves(profileResponse);

            handler.getOwnProfile()
                .then((response) => {
                    response.kind.should.equal('t5');
                    response.data.should.match({
                        title: 'Elder Dragon Highlander',
                        subscribers: 94350,
                        name: 't5_2scee'
                    });
                    done();
                })
                .catch(() => {
                    throw new Error();
                });
        });
    });

    describe('searchInComments', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should throw an error when reddit returns a non-200', (done) => {
            const badRequestResponse = {
                statusCode: 401,
                statusMessage: 'Unauthorized'
            };

            sandbox.stub(got, 'get').resolves(badRequestResponse);

            handler.searchInComments('underrated comment')
                .then(() => {
                    done(new Error('should have thrown'));
                })
                .catch((err) => {
                    err.should.be.Error();
                    err.message.should.be.equal('There was a problem retrieving comments');
                    done();
                });
        });

        it('should return matching comments when reddit returns a 200 (without sub specified)', (done) => {
            const searchResponse = {
                statusCode: 200,
                statusMessage: 'OK',
                body: JSON.stringify({
                    data: [
                        {
                            id: 'f6eer56',
                            parent_id: 't1_f6e0rhq',
                            author: 'papaganda22',
                            subreddit: 'food',
                            score: -1,
                            useless: 999,
                            junk: 999
                        }
                    ]
                })
            };

            sandbox.stub(got, 'get').resolves(searchResponse);

            handler.searchInComments('underrated comment')
                .then((response) => {
                    response[0].should.eql({
                        id: 't1_f6eer56',
                        parentId: 't1_f6e0rhq',
                        author: 'papaganda22',
                        subreddit: 'food',
                        score: -1
                    });
                    done();
                })
                .catch(() => {
                    throw new Error();
                });
        });

        it('should return matching comments when reddit returns a 200 (with sub specified)', (done) => {
            const searchResponse = {
                statusCode: 200,
                statusMessage: 'OK',
                body: JSON.stringify({
                    data: [
                        {
                            id: 'f6eer56',
                            parent_id: 't1_f6e0rhq',
                            author: 'papaganda22',
                            subreddit: 'food',
                            score: -1,
                            useless: 999,
                            junk: 999
                        }
                    ]
                })
            };

            sandbox.stub(got, 'get').resolves(searchResponse);

            handler.searchInComments('underrated comment', 'AskReddit')
                .then((response) => {
                    response[0].should.eql({
                        id: 't1_f6eer56',
                        parentId: 't1_f6e0rhq',
                        author: 'papaganda22',
                        subreddit: 'food',
                        score: -1
                    });
                    done();
                })
                .catch(() => {
                    throw new Error();
                });
        });
    });

    describe('replyToComment', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should throw an error when reddit returns a non-200', (done) => {
            const badRequestResponse = {
                statusCode: 401,
                statusMessage: 'Unauthorized'
            };

            sandbox.stub(got, 'post').resolves(badRequestResponse);

            handler.replyToComment('t1_999999')
                .then(() => {
                    done(new Error('should have thrown'));
                })
                .catch((err) => {
                    err.should.be.Error();
                    err.message.should.be.equal('There was a problem submitting your reply');
                    done();
                });
        });

        it('should return profile details when reddit returns a 200', (done) => {
            const searchResponse = {
                statusCode: 200,
                statusMessage: 'OK',
                body: JSON.stringify({
                    success: true
                })
            };

            sandbox.stub(got, 'post').resolves(searchResponse);

            handler.replyToComment('t1_999999')
                .then((response) => {
                    response.should.eql(true);
                    done();
                })
                .catch(() => {
                    throw new Error();
                });
        });
    });
});
