'use strict';

const Promise = require('bluebird');
const AWS = require('aws-sdk');

class ParameterStoreLoader {
    constructor({ paramPrefix = null, region, ssm }) {
        if (!region) {
            throw new Error('[ParameterStoreLoader] invalid region');
        }
        this.ssm = ssm || Promise.promisifyAll(new AWS.SSM({ region }), { suffix: 'Promise' });
        this.paramPrefix = paramPrefix;
    }

    getParameterFromStore(key, prefix) {
        return getParameterFromStoreImpl(this, key, prefix);
    }

    getParametersFromStore(keys, prefix) {
        return getParametersFromStoreImpl(this, keys, prefix);
    }
}

const getParameterFromStoreImpl = Promise.method((self, key, prefix) => {
    if (!key) {
        throw new Error('[ParameterStoreLoader] key missing');
    }

    const req = { Name: key, WithDecryption: true };

    return self.ssm.getParameterPromise(req)
        .then(({ Parameter }) => {
            if (Parameter.Type === 'StringList') {
                return Parameter.Value.split(',');
            }
            return Parameter.Value;
        });
});

const getParametersFromStoreImpl = Promise.method((self, keys, prefix) => {
    console.log('>>>> getParametersFromStoreImpl started');
    if (!keys || !keys.length) {
        console.log('>>>> getParametersFromStoreImpl keys missing');
        throw new Error('[ParameterStoreLoader] keys missing');
    }

    const req = { Names: keys, WithDecryption: true };
    console.log('>>>> getParametersFromStoreImpl req');

    return self.ssm.getParametersPromise(req)
        .then(({ Parameters }) => {
            console.log('>>>> getParametersFromStoreImpl got parameters');
            return mapParameters(Parameters, prefix);
        });
});

const mapParameters = (parameters, prefix) => {
    console.log('>>>> mapParameters started');
    const ret = {};
    for (const p of parameters) {
        const name = p.Name.substring(prefix ? prefix.length : 0);
        ret[name] = p.Type === 'StringList' ? p.Value.split(',') : p.Value;
    }
    return ret;
};

module.exports = ParameterStoreLoader;
