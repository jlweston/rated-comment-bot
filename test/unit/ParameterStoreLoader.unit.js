const sandbox = require('sinon').createSandbox();
const AWS = require('aws-sdk');
const should = require('should'); // eslint-disable-line no-unused-vars
const ParameterStoreLoader = require('../../src/ParameterStoreLoader');

const { SSM } = AWS;

describe('ParameterStoreLoader', () => {
    let handler;
    let options;

    beforeEach(() => {
        options = {
            region: 'eu-west-1',
            paramPrefix: 'ratedCommentBot'
        };

        handler = new ParameterStoreLoader(options);
    });

    afterEach(() => {
        sandbox.restore();
    });

    describe('constructor', () => {
        it('should create an instance of ParameterStoreLoader', (done) => {
            try {
                handler.should.be.an.instanceof(ParameterStoreLoader);

                done();
            } catch (err) {
                done(err instanceof Error ? err : new Error());
            }
        });

        it('should throw if no region specified', (done) => {
            delete options.region;
            try {
                handler = new ParameterStoreLoader(options);
            } catch (err) {
                err.should.be.an.instanceOf(Error);
                err.message.should.equal('[ParameterStoreLoader] invalid region');
                done();
            }
        });

        it('should assign properties', (done) => {
            try {
                handler.ssm.should.be.an.instanceOf(SSM);
                handler.paramPrefix.should.equal('ratedCommentBot');

                done();
            } catch (err) {
                done(err instanceof Error ? err : new Error(err));
            }
        });
    });

    describe('getParameterFromStore', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should return the retrieved parameter (String)', () => {
            sandbox.stub(handler.ssm, 'getParameterPromise').resolves({
                Parameter: {
                    Name: 'TEST',
                    Type: 'String',
                    Value: 'just-a-test'
                }
            });
            return handler.getParameterFromStore('TEST')
                .then((response) => {
                    response.should.equal('just-a-test');
                });
        });

        it('should return the retrieved parameter (StringList)', () => {
            sandbox.stub(handler.ssm, 'getParameterPromise').resolves({
                Parameter: {
                    Name: 'TEST',
                    Type: 'StringList',
                    Value: 'just-a-test,another-test'
                }
            });
            return handler.getParameterFromStore('TEST')
                .then((response) => {
                    response.should.eql(['just-a-test', 'another-test']);
                });
        });

        it('should throw if no keys provided', (done) => {
            handler.getParameterFromStore()
                .then(() => {
                    throw new Error('should have thrown');
                })
                .catch(() => {
                    done();
                });
        });
    });

    describe('getParametersFromStore', () => {
        afterEach(() => {
            sandbox.restore();
        });

        it('should return the retrieved parameters (String)', () => {
            sandbox.stub(handler.ssm, 'getParametersPromise').resolves({
                Parameters: [{
                    Name: 'TEST',
                    Type: 'String',
                    Value: 'just-a-test'
                }]
            });

            return handler.getParametersFromStore(['TEST'])
                .then((response) => {
                    response.should.match({ TEST: 'just-a-test' });
                });
        });

        it('should return the retrieved parameters (StringList)', () => {
            sandbox.stub(handler.ssm, 'getParametersPromise').resolves({
                Parameters: [{
                    Name: 'TEST',
                    Type: 'StringList',
                    Value: 'just-a-test'
                }, {
                    Name: 'ICLES',
                    Type: 'StringList',
                    Value: 'another-test'
                }]
            });

            return handler.getParametersFromStore(['TEST', 'ICLES'])
                .then((response) => {
                    response.should.eql({ TEST: ['just-a-test'], ICLES: ['another-test'] });
                });
        });

        it('should return the retrieved parameters (mixed)', () => {
            sandbox.stub(handler.ssm, 'getParametersPromise').resolves({
                Parameters: [{
                    Name: 'TEST',
                    Type: 'String',
                    Value: 'just-a-test'
                }, {
                    Name: 'ICLES',
                    Type: 'StringList',
                    Value: 'another-test'
                }]
            });

            return handler.getParametersFromStore(['TEST', 'ICLES'])
                .then((response) => {
                    response.should.eql({ TEST: 'just-a-test', ICLES: ['another-test'] });
                });
        });

        it('should throw if no keys provided', (done) => {
            handler.getParametersFromStore()
                .then(() => {
                    throw new Error('should have thrown');
                })
                .catch(() => {
                    done();
                });
        });
    });
});
