const sandbox = require('sinon').createSandbox();
const got = require('got');
const should = require('should'); // eslint-disable-line no-unused-vars
const TokenHandler = require('../../src/TokenHandler');

describe('TokenHandler', () => {
    let handler;
    let config;
    const clientId = 'some_id';
    const clientSecret = 'some_secret';
    const username = 'username';
    const password = 'password';

    beforeEach(() => {
        // eslint-disable-next-line prefer-destructuring
        config = {
            clientId,
            clientSecret,
            username,
            password
        };

        handler = new TokenHandler(config);
    });

    afterEach(() => {
        sandbox.reset();
    });

    it('should create an instance of TokenHandler', (done) => {
        try {
            handler.should.be.an.instanceof(TokenHandler);

            done();
        } catch (err) {
            done(err instanceof Error ? err : new Error());
        }
    });

    it('should assign properties', (done) => {
        try {
            handler.clientId.should.eql(clientId);
            handler.clientSecret.should.eql(clientSecret);
            handler.username.should.eql(username);
            handler.password.should.eql(password);

            done();
        } catch (err) {
            done(err instanceof Error ? err : new Error(err));
        }
    });

    describe('getAccessToken', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should throw if incorrect credentials used', (done) => {
            const badPostResponse = {
                statusCode: 401,
                statusMessage: 'Unauthorized'
            };

            sandbox.stub(got, 'post').resolves(badPostResponse);
            handler.getAccessToken()
                .then(() => {
                    done(new Error('should have thrown'));
                })
                .catch(() => {
                    got.post.callCount.should.eql(1);
                    handler.getAccessToken.should.throw();
                    done();
                });
        });

        it('should return access token data if correct credentials used', (done) => {
            const goodPostResponse = {
                statusCode: 200,
                statusMessage: 'OK',
                body: JSON.stringify({ access_token: 'got-a-token' })
            };

            sandbox.stub(got, 'post').resolves(goodPostResponse);

            handler.getAccessToken()
                .then((response) => {
                    got.post.callCount.should.eql(1);
                    response.should.equal('got-a-token');
                    done();
                })
                .catch((err) => {
                    done(err instanceof Error ? err : new Error(err));
                });
        });
    });
});
