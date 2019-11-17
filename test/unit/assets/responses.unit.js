const _ = require('underscore');

const { responses, getRandomResponse } = require('../../../src/assets/responses');

describe('responses file', () => {
    it('should export an array of possible responses', () => {
        responses.should.be.Array();
    });

    describe('should only contain strings', () => {
        const testArrayEntry = (entry) => {
            it('should be a string', () => {
                entry.should.be.a.String(); /* ?+ */
                entry.length.should.be.greaterThan(20);
            });
        };

        responses.forEach(testArrayEntry);
    });

    describe('', () => {
        it('should return a string from responses', () => {
            getRandomResponse()
                .then((randomResponse) => {
                    randomResponse.should.be.a.String();
                    _.contains(responses, randomResponse).should.eql(true);
                });
        });
    });
});
